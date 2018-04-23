REM git checkout package.json package-lock.json
REM git pull

rd /q /s node_modules
npm install && npm update && npm dedupe