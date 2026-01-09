# API Documentation

## Endpoint Overview

| Method | Endpoint         | Description                                | Auth | Success Code |
| ------ | ---------------- | ------------------------------------------ | ---- | ------------ |
| POST   | `/upload`        | Upload master image and trigger processing | None | 202 Accepted |
| GET    | `/status/:jobId` | Retrieve current job state and asset URLs  | None | 200 OK       |
| GET    | `/health`        | Health check endpoint                      | None | 200 OK       |

---

## Upload Image

**POST** `/upload`

Uploads a raw image file and queues it for asynchronous processing. The image will be converted to multiple formats (WebP and mobile-optimized JPEG) and a blur placeholder will be generated.

### Request

**Content-Type:** `multipart/form-data`

#### Request Body Parameters

| Field | Type | Required | Description                        |
| ----- | ---- | -------- | ---------------------------------- |
| image | File | Yes      | Binary image data (JPG, PNG, WebP) |

#### Request Example

```bash
curl -X POST http://localhost:3000/upload \
  -F "image=@/path/to/image.jpg"
```

### Response

#### Success Response — `202 Accepted`

```json
{
  "message": "Image uploaded",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Error Responses

**400 Bad Request** — No image provided

```json
{
  "message": "No image provided"
}
```

**500 Internal Server Error** — Server error

```json
{
  "message": "Internal server error"
}
```

### Response Schema

| Field   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| message | string | Status message                  |
| jobId   | string | Unique job identifier (UUID v4) |

---

## Check Job Status

**GET** `/status/:jobId`

Retrieves the current status of an image processing job, including processed assets when the job is completed.

### Request

#### Path Parameters

| Parameter | Type   | Required | Description                         |
| --------- | ------ | -------- | ----------------------------------- |
| jobId     | string | Yes      | Job identifier from upload response |

#### Request Example

```bash
curl http://localhost:3000/status/550e8400-e29b-41d4-a716-446655440000
```

### Response

#### Success Response — `200 OK`

**When job is completed:**

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
      "placeholder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA..."
    }
  },
  "error": null
}
```

**When job is still processing:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "processed": false,
  "data": null,
  "error": null
}
```

**When job has failed:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "processed": false,
  "data": null,
  "error": "Failed to process images"
}
```

#### Error Response — `404 Not Found`

```json
{
  "error": "Job not found in the system."
}
```

### Response Schema

| Field     | Type    | Description                                                                   |
| --------- | ------- | ----------------------------------------------------------------------------- |
| id        | string  | Job identifier                                                                |
| status    | string  | Job state: `waiting`, `active`, `completed`, `failed`, or `delayed`           |
| processed | boolean | Whether the job has completed successfully                                    |
| data      | object  | Processed image data (null if not completed). Contains `success` and `assets` |
| error     | string  | Error message if job failed (null if successful)                              |

### Job Status Values

| Status      | Description                               |
| ----------- | ----------------------------------------- |
| `waiting`   | Job is queued and waiting to be processed |
| `active`    | Job is currently being processed          |
| `completed` | Job completed successfully                |
| `failed`    | Job failed during processing              |
| `delayed`   | Job processing is delayed                 |

### Assets Schema

When `processed` is `true`, the `data.assets` object contains:

| Field       | Type   | Description                                                |
| ----------- | ------ | ---------------------------------------------------------- |
| webp        | string | Path to WebP version of the image                          |
| mobile      | string | Path to mobile-optimized JPEG (max width 800px)            |
| placeholder | string | Base64-encoded blur placeholder (10x10px) for lazy loading |

---

## Health Check

**GET** `/health`

Simple health check endpoint to verify the server is running.

### Response — `200 OK`

```json
{
  "message": "Server is running"
}
```
