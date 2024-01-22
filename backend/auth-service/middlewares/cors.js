import cors from 'cors';

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:80',
    'https://proxy.hoppscotch.io/',
    'http://localhost:5173/',
    'http://localhost:4000'
]

export const corsMiddleware = ({acceptedOrigins = ACCEPTED_ORIGINS} = {}) => {
    const corsOptions = {
        origin: function (origin, callback) {
            if (acceptedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 200,
    };

    return (req, res, next) => {
        if (req.method === 'OPTIONS') {
            // preflight request. reply successfully:
            return cors(corsOptions)(req, res, next);
        } else {
            // actual request. validate origin first:
            if (!req.headers.origin || acceptedOrigins.includes(req.headers.origin)) {
                return cors(corsOptions)(req, res, next);
            } else {
                return res.status(403).json({message: 'Not allowed by CORS'});
            }
        }
    };
};