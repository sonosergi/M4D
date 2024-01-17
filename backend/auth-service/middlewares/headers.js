import helmet from 'helmet';
import winston from 'winston';

class Middleware {
  constructor() {
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Add +
        },
      },
    });
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
    this.logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500);
    if (process.env.NODE_ENV === 'production') {
      res.send('Something broke!');
    } else {
      res.send(err.stack);
    }
  }
}

export default new Middleware();