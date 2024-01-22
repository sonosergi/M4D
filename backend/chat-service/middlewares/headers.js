import helmet from 'helmet';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const headersMiddleware = (app) => {
  app.use(helmet());
  app.use((req, res, next) => {
    logger.info(`Received a ${req.method} request on ${req.url}`);
    next();
  });
};

export default headersMiddleware;