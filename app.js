import http from 'http';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const PORT = process.env.PORT || 3000;

// Helper to run shell commands in a specific directory
function runCmd(cmd, cwd) {
  try {
    const stdout = execSync(cmd, { 
      cwd: cwd, 
      encoding: 'utf8', 
      timeout: 120000, // 120 seconds for build/install
      stdio: 'pipe' 
    });
    return { success: true, stdout: stdout, stderr: '' };
  } catch (err) {
    return { 
      success: false, 
      stdout: err.stdout ? err.stdout.toString() : '', 
      stderr: err.stderr ? err.stderr.toString() : err.message 
    };
  }
}

// Automatically find Git repositories on the cPanel account
function findGitRepos() {
  const repos = [];
  const currentDir = process.cwd();
  
  if (fs.existsSync(path.join(currentDir, '.git'))) {
    repos.push(currentDir);
  }
  
  try {
    const parentDir = path.resolve('..');
    const files = fs.readdirSync(parentDir);
    for (const file of files) {
      const fullPath = path.join(parentDir, file);
      if (file.startsWith('.') || file === 'node_modules' || file === 'tmp') continue;
      
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (fs.existsSync(path.join(fullPath, '.git'))) {
            repos.push(fullPath);
          }
          if (file === 'repositories') {
            const subFiles = fs.readdirSync(fullPath);
            for (const subFile of subFiles) {
              const subPath = path.join(fullPath, subFile);
              if (fs.existsSync(path.join(subPath, '.git'))) {
                repos.push(subPath);
              }
            }
          }
        }
      } catch (err) {}
    }
  } catch (err) {}
  
  if (repos.length === 0) {
    repos.push(currentDir);
  }
  
  return [...new Set(repos)];
}

const rescueFile = path.join(__dirname, '.rescue');
const serverCjs = path.join(__dirname, 'dist/server.cjs');

if (fs.existsSync(serverCjs) && !fs.existsSync(rescueFile)) {
  console.log("Booting compiled production server...");
  try {
    require('./dist/server.cjs');
  } catch (err) {
    console.error("Failed to boot production server, falling back to Rescue Console:", err);
    startRescueServer();
  }
} else {
  startRescueServer();
}

function startRescueServer() {
  console.log(`Starting Git & Build Rescue Console on port ${PORT}...`);
  
  const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const action = urlObj.searchParams.get('action');
    const selectedRepo = urlObj.searchParams.get('repo') || process.cwd();
    
    let commandRun = '';
    let commandResult = null;
    const detectedRepos = findGitRepos();

    if (action === 'status') {
      commandRun = `git status (in ${selectedRepo})`;
      commandResult = runCmd('git status', selectedRepo);
    } else if (action === 'reset') {
      commandRun = `git reset --hard HEAD (in ${selectedRepo})`;
      commandResult = runCmd('git reset --hard HEAD', selectedRepo);
    } else if (action === 'clean') {
      commandRun = `git clean -fd (in ${selectedRepo})`;
      commandResult = runCmd('git clean -fd', selectedRepo);
    } else if (action === 'pull') {
      commandRun = `git pull origin main (in ${selectedRepo})`;
      commandResult = runCmd('git pull origin main', selectedRepo);
    } else if (action === 'npm_install') {
      commandRun = `npm install (in ${selectedRepo})`;
      commandResult = runCmd('npm install --no-audit --no-fund', selectedRepo);
    } else if (action === 'npm_build') {
      commandRun = `npm run build (in ${selectedRepo})`;
      commandResult = runCmd('npm run build', selectedRepo);
    } else if (action === 'listfiles') {
      commandRun = `ls -la (in ${selectedRepo})`;
      commandResult = runCmd('ls -la', selectedRepo);
    } else if (action === 'start_production') {
      try {
        if (fs.existsSync(rescueFile)) {
          fs.unlinkSync(rescueFile);
        }
        commandRun = 'Switch to Production Mode';
        commandResult = {
          success: true,
          stdout: 'Successfully switched to production mode! Please click "RESTART" in the cPanel Node.js Application Manager to boot your live application.',
          stderr: ''
        };
      } catch (e) {
        commandRun = 'Switch to Production Mode';
        commandResult = { success: false, stdout: '', stderr: e.message };
      }
    } else if (action === 'start_rescue') {
      try {
        fs.writeFileSync(rescueFile, 'active');
        commandRun = 'Switch to Rescue Mode';
        commandResult = {
          success: true,
          stdout: 'Successfully switched to Rescue Mode! Please click "RESTART" in the cPanel Node.js Application Manager to boot this console.',
          stderr: ''
        };
      } catch (e) {
        commandRun = 'Switch to Rescue Mode';
        commandResult = { success: false, stdout: '', stderr: e.message };
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>cPanel Git & Build Console</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 24px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border: 1px solid #334155;
          }
          h1 {
            font-size: 24px;
            margin-top: 0;
            color: #38bdf8;
            border-bottom: 2px solid #334155;
            padding-bottom: 12px;
          }
          p {
            color: #94a3b8;
            font-size: 15px;
            line-height: 1.6;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .status-rescue {
            background-color: #f59e0b;
            color: #0f172a;
          }
          .status-production {
            background-color: #10b981;
            color: white;
          }
          .form-section {
            background-color: #0f172a;
            border: 1px solid #334155;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
          }
          label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #38bdf8;
          }
          select {
            width: 100%;
            background-color: #1e293b;
            color: white;
            border: 1px solid #475569;
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
          }
          .btn-group-title {
            font-size: 14px;
            font-weight: bold;
            color: #94a3b8;
            margin-top: 16px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #0284c7;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: background-color 0.2s;
            font-size: 14px;
          }
          .btn:hover {
            background-color: #0369a1;
          }
          .btn-danger {
            background-color: #dc2626;
          }
          .btn-danger:hover {
            background-color: #b91c1c;
          }
          .btn-success {
            background-color: #16a34a;
          }
          .btn-success:hover {
            background-color: #15803d;
          }
          .btn-warning {
            background-color: #d97706;
            color: white;
          }
          .btn-warning:hover {
            background-color: #b45309;
          }
          .output-box {
            background-color: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 16px;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 13px;
            line-height: 1.5;
            overflow-x: auto;
            margin-top: 24px;
            white-space: pre-wrap;
          }
          .success {
            color: #4ade80;
          }
          .error {
            color: #f87171;
          }
          .header-meta {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>cPanel Git & Build Console 🛠️</h1>
          <div class="header-meta">
            <strong>Current Path:</strong> ${process.cwd()}<br>
            <strong>Node.js Version:</strong> ${process.version}<br>
            <strong>Mode:</strong> <span class="status-badge ${fs.existsSync(rescueFile) ? 'status-rescue' : 'status-production'}">${fs.existsSync(rescueFile) ? 'RESCUE / MAINTENANCE MODE' : 'PRODUCTION MODE'}</span>
          </div>
          
          <p>This utility helps you manage Git pulls, install npm dependencies, and compile your full-stack React/Express application directly from the browser on cPanel without SSH access.</p>
          
          <form id="actionForm" method="GET">
            <div class="form-section">
              <label for="repo">Select Git Repository Folder:</label>
              <select name="repo" id="repo">
                ${detectedRepos.map(r => `<option value="${r}" ${selectedRepo === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
            
            <input type="hidden" name="action" id="actionInput" value="">
            
            <div class="btn-group-title">1. Git Operations</div>
            <div class="grid">
              <button type="button" onclick="runAction('status')" class="btn">Check Git Status</button>
              <button type="button" onclick="runAction('pull')" class="btn btn-warning">Pull from GitHub (git pull)</button>
              <button type="button" onclick="runAction('reset')" class="btn btn-danger">Discard Changes (git reset)</button>
              <button type="button" onclick="runAction('clean')" class="btn btn-danger">Clean Untracked (git clean)</button>
            </div>

            <div class="btn-group-title">2. Package & Build Operations</div>
            <div class="grid">
              <button type="button" onclick="runAction('npm_install')" class="btn btn-warning">NPM Install</button>
              <button type="button" onclick="runAction('npm_build')" class="btn btn-success">NPM Run Build</button>
              <button type="button" onclick="runAction('listfiles')" class="btn">List All Files (ls)</button>
            </div>

            <div class="btn-group-title">3. Mode Selector</div>
            <div class="grid" style="grid-template-columns: 1fr 1fr;">
              <button type="button" onclick="runAction('start_production')" class="btn btn-success">Enable Production Mode</button>
              <button type="button" onclick="runAction('start_rescue')" class="btn btn-danger">Force Rescue Mode</button>
            </div>
          </form>

          ${commandRun ? `
            <h3>Command Run: <code>${commandRun}</code></h3>
            <div class="output-box">
              ${commandResult.success ? '<span class="success">✓ Command completed successfully</span>' : '<span class="error">✗ Command failed</span>'}
              <hr style="border-color: #1e293b; margin: 12px 0;">
              ${commandResult.stdout ? `<strong>Standard Output:</strong>\n${commandResult.stdout}\n` : ''}
              ${commandResult.stderr ? `<strong class="error">Standard Error / Error Details:</strong>\n${commandResult.stderr}\n` : ''}
            </div>
          ` : `
            <div class="output-box" style="color: #64748b; text-align: center; padding: 32px;">
              Select a repository folder and click an action above to run maintenance or build commands.
            </div>
          `}
          
          <div style="margin-top: 32px; border-top: 1px solid #334155; padding-top: 20px; font-size: 13px; color: #64748b;">
            <strong>Step-by-Step Deployment Protocol:</strong>
            <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
              <li>Verify the active folder is selected in the dropdown.</li>
              <li>Click <strong>Pull from GitHub</strong> to grab the latest code.</li>
              <li>Click <strong>NPM Install</strong> to ensure all required libraries are installed.</li>
              <li>Click <strong>NPM Run Build</strong> to compile the backend and frontend.</li>
              <li>Click <strong>Enable Production Mode</strong>.</li>
              <li>Go to your cPanel Node.js Application Manager, and click <strong>RESTART</strong> to bring your live site online!</li>
            </ol>
          </div>
        </div>
        
        <script>
          function runAction(actionName) {
            document.getElementById('actionInput').value = actionName;
            document.getElementById('actionForm').submit();
          }
        </script>
      </body>
      </html>
    `);
    res.end();
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Git & Build Rescue Server running on port ${PORT}`);
  });
}
