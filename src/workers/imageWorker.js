import { Worker } from 'bullmq';
import fs from 'fs/promises';

import { IMAGE_QUEUE_NAME, redisConnection } from '../queues/connections.js';
import { processImage } from '../services/imageProcessor.js';

const imageWorker = new Worker(IMAGE_QUEUE_NAME, async (job) => {
    try {        
        const resultImage = await processImage(job.data);
        
        // Clean up the original uploaded file to save disk space
        await fs.unlink(job.data.path);
        // Return the result image (This becomes the "Job Result" stored in Redis)
        return resultImage;
        } catch (error) {
            console.error('Image Worker Error with job ID:', job.id, error.message);
            throw error;
        }
    },
    {
        connection: redisConnection,
    }
);

imageWorker.on('failed', (job, error) => {
    console.error(`Job ${job.id} has failed with ${error.message}`);
});
