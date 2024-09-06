// src/index.ts
import 'reflect-metadata'; // Required by tsyringe for DI
import express from 'express';
import { container } from 'tsyringe';
import { BatchController } from './controllers/BatchController';

const app = express();
const port = 3000;

// Get controller from DI container
const batchController = container.resolve(BatchController);

app.post('/process-batches', (req, res) => batchController.initiateBatchProcess(req, res));
app.post('/download-results', (req, res) => batchController.downloadResults(req, res));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
