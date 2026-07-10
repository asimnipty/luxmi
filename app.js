import http from 'http';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Helper to run shell commands in a specific directory
function runCmd(cmd, cwd) {
  try {
    const stdout = execSync(cmd, { 
      cwd: cwd, 
      encoding: 'utf8', 
      timeout: 15000, 
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
  
  // 1. Check current directory (Application Root)
  if (fs.existsSync(path.join(currentDir, '.git'))) {
    repos.push(currentDir);
  }
  
  // 2. Scan parent folder (/home/bisharod) and subdirectories
  try {
    const parentDir = path.resolve('..');
    const files = fs.readdirSync(parentDir);
    for (const file of files) {
      const fullPath = path.join(parentDir, file);
      
      // Skip node_modules or system files
      if (file.startsWith('.') || file === 'node_modules' || file === 'tmp') continue;
      
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Check if this subfolder is a Git repo
          if (fs.existsSync(path.join(fullPath, '.git'))) {
            repos.push(fullPath);
          }
          
          // If it's the "repositories" folder, scan its children (very common in cPanel)
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
  
  // Fallback to current directory if nothing found
  if (repos.length === 0) {
    repos.push(currentDir);
  }
  
  return [...new Set(repos)]; // return unique paths
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action');
  const selectedRepo = urlObj.searchParams.get('repo') || process.cwd();
  
  let commandRun = '';
  let commandResult = null;
  const detectedRepos = findGitRepos();

  // If the user selects a repository, run the command inside it
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
  } else if (action === 'listfiles') {
    commandRun = `ls -la (in ${selectedRepo})`;
    commandResult = runCmd('ls -la', selectedRepo);
  } else if (action === 'restore') {
    try {
      // Overwrite app.js with the real production loader
      fs.writeFileSync('app.js', `// This file acts as the entry point for cPanel / Phusion Passenger hosting\n// It automatically boots the compiled full-stack server\nimport('./dist/server.cjs');\n`);
      commandRun = 'Restore App';
      commandResult = { 
        success: true, 
        stdout: 'Successfully restored app.js to real production startup file! Please click "RESTART" in cPanel Node.js App Manager to apply and bring your live site online.', 
        stderr: '' 
      };
    } catch (e) {
      commandRun = 'Restore App';
      commandResult = { success: false, stdout: '', stderr: e.message };
    }
  }

  // Generate HTML response
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>cPanel Git Rescue Console</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          color: #f1f5f9;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 800px;
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
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 24px 0;
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
        <h1>cPanel Git Rescue Console 🛠️</h1>
        <div class="header-meta">
          <strong>Current Path:</strong> ${process.cwd()}<br>
          <strong>Node.js Version:</strong> ${process.version}
        </div>
        
        <p>Since you don't have Terminal/SSH access to cPanel, this web console runs maintenance commands directly in your folders to clean up Git and unblock cPanel's deployment.</p>
        
        <form id="actionForm" method="GET">
          <div class="form-section">
            <label for="repo">Select Git Repository Folder:</label>
            <select name="repo" id="repo">
              ${detectedRepos.map(r => `<option value="${r}" ${selectedRepo === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          
          <input type="hidden" name="action" id="actionInput" value="">
          
          <div class="grid">
            <button type="button" onclick="runAction('status')" class="btn">1. Check Git Status</button>
            <button type="button" onclick="runAction('reset')" class="btn btn-danger">2. Discard Edits (git reset)</button>
            <button type="button" onclick="runAction('clean')" class="btn btn-danger">3. Delete Untracked (git clean)</button>
            <button type="button" onclick="runAction('listfiles')" class="btn">List Files</button>
          </div>
        </form>
        
        <div class="grid" style="grid-template-columns: 1fr;">
          <a href="?action=restore" class="btn btn-success">Restore & Resume Real Application</a>
        </div>

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
            Select a repository folder and click an action above to run maintenance commands.
          </div>
        `}
        
        <div style="margin-top: 32px; border-top: 1px solid #334155; padding-top: 20px; font-size: 13px; color: #64748b;">
          <strong>Deployment Recovery Steps:</strong>
          <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
            <li>Select your repository folder in the dropdown above (e.g., the one under <code>repositories/</code>).</li>
            <li>Click <strong>Check Git Status</strong> to see what files are blocking cPanel.</li>
            <li>Click <strong>Discard Edits (git reset)</strong> and <strong>Delete Untracked (git clean)</strong> to make the branch completely clean.</li>
            <li>Go back to cPanel Git Version Control interface, and click <strong>Deploy HEAD Commit</strong>.</li>
            <li>Once deployed, click the green <strong>Restore & Resume Real Application</strong> button here.</li>
            <li>Click <strong>RESTART</strong> in cPanel Node.js App Manager to put your live site online!</li>
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
  console.log(`Git Rescue Server running on port ${PORT}`);
});
