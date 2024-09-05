// src/repositories/OpenAIRepository.ts
import OpenAI from 'openai';
import fs from 'fs';
import { AppConfig } from '../config/AppConfig';
import { AppError, handleApiError } from '../utils/ErrorHandler';
import { RateLimiterMiddleware } from '../middleware/RateLimiterMiddleware';
import { CreateBatchDTO } from '../dto/CreateBatchDTO';
import { FileUploadDTO } from '../dto/FileUploadDTO';
import { Batch } from '../models/Batch';
import { OpenAIFile } from '../models/OpenAIFile';

const client = new OpenAI({ apiKey: AppConfig.openaiApiKey });

export class OpenAIRepository {
  static async uploadFile(fileUploadDTO: FileUploadDTO): Promise<OpenAIFile | null> {
    try {
      return await RateLimiterMiddleware(async () => {

        const response = await client.files.create(
          {
            file: fs.createReadStream(fileUploadDTO.file),
            purpose: fileUploadDTO.purpose
          });

        return new OpenAIFile(response);
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }

  static async createBatch(createBatchDTO : CreateBatchDTO ): Promise<Batch | null> {
    try {
      return await RateLimiterMiddleware(async () => {
        const response = await client.batches.create(createBatchDTO);
        return new Batch(response);
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }

  static async downloadResults(fileId: string): Promise<string | null>{
    try {
      return await RateLimiterMiddleware(async () => {
        const fileResponse = await client.files.content(fileId);
        return await fileResponse.text();
      });
    } catch (error) {
       handleApiError(error);
       return null;
    }
  }

  static async listBatches(limit = 20): Promise<Batch[] | null>{
    try {
      return await RateLimiterMiddleware(async () => {
        const allBatches: Batch[] = [];
        for await (const batch of client.batches.list({ limit })) {
          allBatches.push(new Batch(batch));
        }
        return allBatches;
      });
    } catch (error) {
       handleApiError(error);
       return null;
    }
  }
}
