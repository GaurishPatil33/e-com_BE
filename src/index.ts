import app from './app';
import http from 'http';
import { PORT } from './config';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';

dotenv.config({
    path: './.env'
});

const server = http.createServer(app);

const port = PORT || 8000;

const startServer = async () => {
    await connectRedis();
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();