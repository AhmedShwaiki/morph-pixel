# Morph Pixel

**Async Image Processing API** - A Node.js service that processes images asynchronously, converting them into multiple optimized formats (WebP and mobile-optimized JPEG) with automatic blur placeholder generation.

## What It Does

Morph Pixel is an asynchronous image processing service built with Express, BullMQ, and Sharp. It allows you to:

- **Upload images** via REST API
- **Process images asynchronously** in the background using job queues
- **Generate multiple formats**:
  - WebP version for modern browsers
  - Mobile-optimized JPEG (max width 800px)
  - Base64 blur placeholder for lazy loading
- **Check job status** and retrieve processed assets

### Example Workflow

1. Upload an image → Receive a `jobId`
2. Image is queued for processing
3. Worker processes the image in the background
4. Poll the status endpoint with `jobId`
5. Retrieve optimized image assets when processing completes

## Prerequisites

- **Node.js** (v18 or higher)
- **Redis** (for job queue management)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmedShwaiki/morph-pixel.git
   cd morph-pixel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install and start Redis**
   
   On Linux Mint/Ubuntu:
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```
   
   Verify Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

4. **Configure environment variables** (optional)
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   NODE_ENV=development
   ```

## Running the Project

### Development Mode

```bash
npm run dev
```

This starts the server with `nodemon` for auto-reloading on file changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Usage Example

### 1. Upload an Image

```bash
curl -X POST http://localhost:3000/upload \
  -F "image=@path/to/your/image.jpg"
```

**Response:**
```json
{
  "message": "Image uploaded",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Check Job Status

```bash
curl http://localhost:3000/status/550e8400-e29b-41d4-a716-446655440000
```

**Response (when completed):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "processed": true,
  "data": {
    "success": true,
    "assets": {
      "webp": "output/550e8400-e29b-41d4-a716-446655440000.webp",
      "mobile": "output/550e8400-e29b-41d4-a716-446655440000-mobile.jpg",
      "placeholder": "data:image/png;base64,iVBORw0KGgo..."
    }
  },
  "error": null
}
```

### 3. Health Check

```bash
curl http://localhost:3000/health
```

## Project Structure

```
root/
├── src/
│   ├── api/            # Express routes and controllers
│   ├── queues/         # BullMQ queue definitions
│   ├── workers/        # Worker logic (Consumer)
│   ├── services/       # Core logic (Sharp image processing)
│   └── utils/          # Shared helpers
├── tests/              # Unit and Integration tests
├── uploads/            # Temporary storage for raw uploads
├── output/             # Where processed images land
└── index.js            # Entry point
```

## API Documentation

For detailed API documentation, see [docs/api.md](./docs/api.md).

## Technologies

- **Express.js** - Web framework
- **BullMQ** - Job queue system
- **Sharp** - High-performance image processing
- **Multer** - File upload handling
- **Redis** - Queue backend
- **Jest** - Testing framework

## License

MIT License - see [LICENSE](./LICENSE) file for details.
