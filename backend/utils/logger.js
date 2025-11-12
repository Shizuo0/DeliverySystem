const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, process.env.LOG_FILE || 'app.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    return `[${timestamp}] [${level.toUpperCase()}] ${logMessage}\n`;
  }

  writeLog(level, message) {
    const formattedMessage = this.formatMessage(level, message);
    
    // Write to console
    console.log(formattedMessage.trim());
    
    // Write to file
    fs.appendFile(this.logFile, formattedMessage, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  }

  info(message) {
    this.writeLog('info', message);
  }

  error(message) {
    this.writeLog('error', message);
  }

  warn(message) {
    this.writeLog('warn', message);
  }

  debug(message) {
    if (process.env.LOG_LEVEL === 'debug') {
      this.writeLog('debug', message);
    }
  }
}

module.exports = new Logger();
