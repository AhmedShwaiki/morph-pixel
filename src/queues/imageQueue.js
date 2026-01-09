import { Queue } from 'bullmq';
import { redisConnection } from './connections.js';

export const imageQueue = new Queue('image-queue', {
    connection: redisConnection,
});
