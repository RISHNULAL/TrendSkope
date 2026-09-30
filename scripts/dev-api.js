const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

// Resolve virtual environment python executable
const venvPath = path.join(projectRoot, '.venv');
const pythonExe = isWindows
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

if (!fs.existsSync(venvPath) || !fs.existsSync(pythonExe)) {
  console.error('\x1b[31m%s\x1b[0m', 'Python environment not found. Install the Python dependencies first.');
  console.error('\x1b[33m%s\x1b[0m', 'Expected virtual environment at: ' + venvPath);
  console.error('To create it, run:');
  console.error('  python -m venv .venv');
  console.error(isWindows ? '  .\\.venv\\Scripts\\pip install -r requirements.txt' : '  ./.venv/bin/pip install -r requirements.txt');
  process.exit(1);
}

const args = ['-m', 'uvicorn', 'api.index:app', '--reload', '--port', '8000'];

const child = spawn(pythonExe, args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1',
  },
});

child.on('error', (err) => {
  console.error('\x1b[31m[api] Failed to start FastAPI server:\x1b[0m', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 0);
});

// Forward signals to child process
const handleSignal = (sig) => {
  if (child && !child.killed) {
    child.kill(sig);
  }
};

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));
