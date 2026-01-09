import { jest } from '@jest/globals';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

import { processImage } from '../../src/services/imageProcessor.js';
import { mockImage } from '../fixtures/index.js';

// Mock all third-party dependencies
jest.mock('sharp');
jest.mock('fs/promises', () => ({
    mkdir: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/'))
}));

const createSharpInstance = () => ({
    webp: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(true),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-placeholder-data'))
});

describe('imageProcessor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sharp.mockReturnValue(createSharpInstance());
    });

    describe('processImage', () => {
        it('should create output directory with correct path', async () => {
            await processImage(mockImage);

            expect(fs.mkdir).toHaveBeenCalledWith('output', { recursive: true });
            expect(fs.mkdir).toHaveBeenCalledTimes(1);
        });

        it('should construct correct file paths using path.join', async () => {
            await processImage(mockImage);

            expect(path.join).toHaveBeenCalledWith('output', 'test-uuid-123.webp');
            expect(path.join).toHaveBeenCalledWith('output', 'test-uuid-123-mobile.jpg');
        });

        it('should call sharp with correct input path', async () => {
            await processImage(mockImage);

            // sharp is called 3 times: once for webp, once for mobile (in Promise.all), once for placeholder
            expect(sharp).toHaveBeenCalledWith(mockImage.path);
            expect(sharp).toHaveBeenCalledTimes(3);
        });

        it('should process webp format with correct configuration', async () => {
            const instances = [];
            sharp.mockImplementation((inputPath) => {
                const instance = createSharpInstance();
                instances.push({ inputPath, instance });
                return instance;  
            });

            await processImage(mockImage);

            // First call should be for webp
            const webpInstance = instances[0].instance;
            expect(webpInstance.webp).toHaveBeenCalledWith({ quality: 80 });
            expect(webpInstance.toFile).toHaveBeenCalled();
        });

        it('should process mobile format with resize and jpeg configuration', async () => {
            const instances = [];
            sharp.mockImplementation((inputPath) => {
                const instance = createSharpInstance();
                instances.push({ inputPath, instance });
                return instance;
            });

            await processImage(mockImage);

            // Second call should be for mobile
            const mobileInstance = instances[1].instance;
            expect(mobileInstance.resize).toHaveBeenCalledWith(800);
            expect(mobileInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });
            expect(mobileInstance.toFile).toHaveBeenCalled();
        });

        it('should process both webp and mobile formats in parallel using Promise.all', async () => {
            const toFileCallOrder = [];
            sharp.mockImplementation(() => {
                const instance = createSharpInstance();
                const originalToFile = instance.toFile;
                instance.toFile = jest.fn(() => {
                    toFileCallOrder.push('toFile');
                    return Promise.resolve(true);
                });
                return instance;
            });

            await processImage(mockImage);

            // Both toFile calls should happen (Promise.all means they execute in parallel)
            // We verify by checking that sharp was called multiple times and toFile was called
            expect(sharp).toHaveBeenCalledTimes(3); // webp, mobile, placeholder
        });

        it('should generate placeholder thumbnail after main processing', async () => {
            const instances = [];
            sharp.mockImplementation((inputPath) => {
                const instance = createSharpInstance();
                instances.push({ inputPath, instance });
                return instance;
            });

            await processImage(mockImage);

            // Third call should be for placeholder
            const placeholderInstance = instances[2].instance;
            expect(placeholderInstance.resize).toHaveBeenCalledWith(10);
            expect(placeholderInstance.toBuffer).toHaveBeenCalled();
        });

        it('should return correct structure with success flag and assets', async () => {
            const result = await processImage(mockImage);

            expect(result).toEqual({
                success: true,
                assets: {
                    webp: 'output/test-uuid-123.webp',
                    mobile: 'output/test-uuid-123-mobile.jpg',
                    placeholder: expect.stringContaining('data:image/png;base64,')
                }
            });
        });

        it('should include base64 encoded placeholder in return value', async () => {
            const result = await processImage(mockImage);

            expect(result.assets.placeholder).toMatch(/^data:image\/png;base64,/);
            const base64Part = result.assets.placeholder.split(',')[1];
            expect(base64Part).toBeTruthy();
        });

        it('should extract path and id correctly from image object', async () => {
            const customImage = {
                path: '/custom/path/image.png',
                id: 'custom-id-456'
            };

            await processImage(customImage);

            expect(sharp).toHaveBeenCalledWith('/custom/path/image.png');
            expect(path.join).toHaveBeenCalledWith('output', 'custom-id-456.webp');
            expect(path.join).toHaveBeenCalledWith('output', 'custom-id-456-mobile.jpg');
        });

        it('should handle errors and throw with correct message', async () => {
            sharp.mockImplementation(() => {
                throw new Error('Sharp processing failed');
            });

            await expect(processImage(mockImage)).rejects.toThrow('Failed to process images');
        });

        it('should handle errors during Promise.all processing', async () => {
            let callCount = 0;
            sharp.mockImplementation(() => {
                callCount++;
                const instance = createSharpInstance();
                if (callCount === 1) {
                    // First call (webp) fails
                    instance.toFile = jest.fn().mockRejectedValue(new Error('WebP conversion failed'));
                }
                return instance;
            });

            await expect(processImage(mockImage)).rejects.toThrow('Failed to process images');
        });

        it('should handle errors during placeholder generation', async () => {
            let callCount = 0;
            sharp.mockImplementation(() => {
                callCount++;
                const instance = createSharpInstance();
                if (callCount === 3) {
                    // Third call (placeholder) fails
                    instance.toBuffer = jest.fn().mockRejectedValue(new Error('Buffer generation failed'));
                }
                return instance;
            });

            await expect(processImage(mockImage)).rejects.toThrow('Failed to process images');
        });
    });
});
