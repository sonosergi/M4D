import cors from 'cors';

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:80',
    'https://proxy.hoppscotch.io/'
]

export const corsMiddleware = ({acceptedOrigins = ACCEPTED_ORIGINS} = {}) => cors({
    origin (origin, callback) {
        console.log("Origin: ", origin); 


        if (acceptedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        if (!origin) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    }
});

