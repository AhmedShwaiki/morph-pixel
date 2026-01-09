import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { imageQueue } from '../queues/imageQueue.js';
import { IMAGE_QUEUE_NAME } from '../queues/connections.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const image = req.file;
        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const jobId = uuidv4();
        const job = await imageQueue.add(IMAGE_QUEUE_NAME, {
            id: jobId,
            originalName: req.file.originalname,
            path: req.file.path,
            mimeType: req.file.mimetype,
            options: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                // opts to reduce memory usage
                removeOnComplete: { count: 100 }, // Keep only the last 100 successful jobs
                removeOnFail: { age: 24 * 3600 }   // Keep failed jobs for 24 hours for debugging
            },
        });

        res.status(202).json({ message: 'Image uploaded', jobId: job.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/status/:jobId', async (req, res) => {
    const { jobId } = req.params;
  
    const job = await imageQueue.getJob(jobId);
  
    if (!job) {
      return res.status(404).json({ error: 'Job not found in the system.' });
    }
  
    const state = await job.getState(); /* waiting, active, completed, failed, delayed */
    
    const result = job.returnvalue; 
    const reason = job.failedReason;
    
    res.status(200).json({
        id: jobId,
        status: state,
        processed: state === 'completed',
        data: result || null,
        error: reason || null
    });
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.listen(PORT, () => console.log(`🚀~Server running on port ${PORT}`));

export default app;
