import { Queue } from 'bullmq';
import { redisConnection, IMAGE_QUEUE_NAME } from './connections.js';

export const imageQueue = new Queue(IMAGE_QUEUE_NAME, {
  connection: redisConnection,
});
