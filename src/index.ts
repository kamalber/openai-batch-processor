import express from 'express';
import { BatchController } from './controllers/BatchController';

const app = express();
const port = process.env.PORT || 3000;


app.post('/process-batch', BatchController.initiateBatchProcess);
app.post('/download-results', BatchController.downloadResults);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
