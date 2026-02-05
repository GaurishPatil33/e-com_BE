import { createClient } from 'redis';
import { REDIS_URL } from './index';

const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis connected successfully');
    } catch (err) {
        console.error('Could not connect to Redis', err);
        process.exit(1);
    }
};

export { redisClient, connectRedis };