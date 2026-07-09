import http from 'http';
import { execSync } from 'child_process';
import fs from 'fs';

const PORT = process.env.PORT || 3000;

function runCmd(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', timeout: 15000, stdio: 'pipe' });
    return { success: true, stdout, stderr: '' };
  } catch (err) {
    return { 
      success: false, 
      stdout: err.stdout ? err.stdout.toString() : '', 
      stderr: err.stderr ? err.stderr.toString() : err.message 
    };
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action');
  
  let commandRun = '';
  let commandResult = null;
  
  if (action === 'status') {
    commandRun = 'git status';
    commandResult = runCmd('git status');
  } else if (action === 'reset') {
    commandRun = 'git reset --hard HEAD';
    commandResult = runCmd('git reset --hard HEAD');
  } else if (action === 'clean') {
    commandRun = 'git clean -fd';
    commandResult = runCmd('git clean -fd');
  } else if (action === 'listfiles') {
    commandRun = 'ls -la';
    commandResult = runCmd('ls -la');
  } else if (action === 'restore') {
    try {
      fs.writeFileSync('app.js', `// This file acts as the entry point for cPanel / Phusion Passenger hosting\n// It automatically boots the compiled full-stack server\nimport './dist/server.cjs';\n`);
      commandRun = 'Restore App';
      commandResult = { success: true, stdout: 'Successfully restored app.js to default production startup file! Please restart the app in cPanel to apply.', stderr: '' };
    } catch (e) {
      commandRun = 'Restore App';
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
        
        <p>Since you don't have Terminal/SSH access to cPanel, this web console allows you to directly run safe maintenance commands to clean up the git repository so that cPanel's deployment pipeline is unblocked.</p>
        
        <div class="grid">
          <a href="?action=status" class="btn">1. Check Git Status</a>
          <a href="?action=reset" class="btn btn-danger">2. Discard Edits (git reset)</a>
          <a href="?action=clean" class="btn btn-danger">3. Delete Untracked (git clean)</a>
          <a href="?action=listfiles" class="btn">List Files</a>
        </div>
        
        <div class="grid" style="grid-template-columns: 1fr;">
          <a href="?action=restore" class="btn btn-success">Restore & Resume Real Application</a>
        </div>

        \${commandRun ? \`
          <h3>Command Run: <code>\${commandRun}</code></h3>
          <div class="output-box">
            \${commandResult.success ? '<span class="success">✓ Command completed successfully</span>' : '<span class="error">✗ Command failed</span>'}
            <hr style="border-color: #1e293b; margin: 12px 0;">
            \${commandResult.stdout ? \`<strong>Standard Output:</strong>\\n\${commandResult.stdout}\\n\` : ''}
            \${commandResult.stderr ? \`<strong class="error">Standard Error / Error Details:</strong>\\n\${commandResult.stderr}\\n\` : ''}
          </div>
        \` : \`
          <div class="output-box" style="color: #64748b; text-align: center; padding: 32px;">
            Select an action above to run maintenance commands.
          </div>
        \`}
        
        <div style="margin-top: 32px; border-top: 1px solid #334155; padding-top: 20px; font-size: 13px; color: #64748b;">
          <strong>Deployment Workflow:</strong>
          <ol style="margin-top: 8px; padding-left: 20px; line-height: 1.6;">
            <li>Click <strong>Check Git Status</strong> to see what files are blocking cPanel.</li>
            <li>Click <strong>Discard Edits (git reset)</strong> and <strong>Delete Untracked (git clean)</strong> to make the branch completely clean.</li>
            <li>Go back to cPanel Git Version Control interface, and click <strong>Deploy HEAD Commit</strong>.</li>
            <li>Once deployed, click the green <strong>Restore & Resume Real Application</strong> button here.</li>
            <li>Click <strong>RESTART APP</strong> in cPanel Node.js App Manager to put your live site online!</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Git Rescue Server running on port \${PORT}`);
});
