import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export const processImage = async (image) => {
    const { path: inputPath, id } = image;
    const OUTPUT_DIR = 'output';

    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const webpPath = path.join(OUTPUT_DIR, `${id}.webp`);
    const mobilePath = path.join(OUTPUT_DIR, `${id}-mobile.jpg`);


    try {
    // 1. Process the image in two formats: webp and mobile
    await Promise.all([
        sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(webpPath),
        sharp(inputPath)
            .resize(800)
            .jpeg({ quality: 80 })
            .toFile(mobilePath),
    ]);

    // 2. Generate the thumbnail
    const placeholder = await sharp(inputPath)
    .resize(10) 
    .toBuffer();
    const blurData = `data:image/png;base64,${placeholder.toString('base64')}`;

    // 3. Return the assets
    return {
        success: true,
        assets: {
          webp: webpPath,
          mobile: mobilePath,
          placeholder: blurData
        }
      };

    } catch (error) {
        console.error('Sharp Processing Error:', error);
        throw new Error('Failed to process images');
    }
};
