const winston = require('winston');

exports.winstonConfig = {
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.json(),
  ),
};
