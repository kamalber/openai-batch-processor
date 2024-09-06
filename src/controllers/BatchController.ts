// src/controllers/BatchController.ts
import { Request, Response } from 'express';
import { BatchService } from '../services/BachService';
import { AppError, handleError } from '../utils/ErrorHandler';
import { injectable } from 'tsyringe';


@injectable()
export class BatchController {
  constructor(private batchService: BatchService) {}

   async initiateBatchProcess(req: Request, res: Response) {
    try {
      await this.batchService.processBatches();
      res.status(200).json({ message: 'Batch process initiated.' });
    } catch (error :any) {
      handleError( error, res);
    }
  }

   async downloadResults(req: Request, res: Response) {
    try {
      await this.batchService.downloadBatchResults();
      res.status(200).json({ message: 'Results downloaded successfully.' });
    }  catch (error :any) {
      handleError( error, res);
    }
  }
}
