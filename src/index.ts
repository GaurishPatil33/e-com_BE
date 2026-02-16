import app from './app';
import http from 'http';
import { PORT } from './config';
import { connectRedis } from './config/redis';
import env from './config/env';

const server = http.createServer(app);

const port = env.PORT;

const startServer = async () => {
    await connectRedis();
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();