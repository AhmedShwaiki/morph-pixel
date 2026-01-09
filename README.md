# morph-pixel

# Project Structure

asset-pipeline/
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
