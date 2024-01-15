import helmet from 'helmet';
import winston from 'winston';

class Middleware {
  constructor() {
    this.helmetMiddleware = helmet();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'auth-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

  winstonMiddleware(req, res, next) {
    this.logger.info(`${req.method} ${req.url}`);
    next();
  }

  winstonErrorMiddleware(err, req, res, next) {
    this.logger.error(err.stack);
    res.status(500).send('Something broke!');
  }
}

export default new Middleware();