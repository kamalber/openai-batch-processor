// src/controllers/BatchController.ts
import { Request, Response } from 'express';
import { BatchService } from '../services/BachService';
import { AppError, handleError } from '../utils/ErrorHandler';

export class BatchController {
  static async initiateBatchProcess(req: Request, res: Response) {
    try {
      await BatchService.processBatches();
      res.status(200).json({ message: 'Batch process initiated.' });
    } catch (error :any) {
      handleError( error, res);
    }
  }

  static async downloadResults(req: Request, res: Response) {
    try {
      await BatchService.downloadBatchResults();
      res.status(200).json({ message: 'Results downloaded successfully.' });
    }  catch (error :any) {
      handleError( error, res);
    }
  }
}
