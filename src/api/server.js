import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { imageQueue } from '../queues/imageQueue.js';

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
        const job = await imageQueue.add('image-transform', {
            id: jobId,
            originalName: req.file.originalname,
            path: req.file.path,
            mimeType: req.file.mimetype,
            options: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                }
            }
        });

        res.status(200).json({ message: 'Image uploaded', jobId: job.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.listen(PORT, () => console.log(`🚀~Server running on port ${PORT}`));

export default app;
