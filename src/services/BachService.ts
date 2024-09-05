// src/services/BatchService.ts
import { Logger } from '../utils/Logger';
import { OpenAIRepository } from '../repositories/OpenAIRepository';
import fs from 'fs';
import path from 'path';
import { AppConfig } from '../config/AppConfig';
import { AppError } from '../utils/ErrorHandler';
import { Batch } from '../models/Batch';
import { OpenAIFile } from '../models/OpenAIFile';
import { CreateBatchDTO } from '../dto/CreateBatchDTO';
import { FileUploadDTO } from '../dto/FileUploadDTO';

export class BatchService {
  static async processBatches() {
    try {
      const localFiles = this.getLocalFilesToUpload();
      if (localFiles.length === 0) {
        Logger.warn('No files are in the source repository to be processed');
        return;
      }

      const openAiBatches = await OpenAIRepository.listBatches();
      if (!openAiBatches || openAiBatches.length === 0) {
        Logger.info('OpenAI Batches list is empty');
        return;
      }

      const filesNewerThanOpenAi = this.getFilesNewerThanOpenAi(localFiles, openAiBatches);
      if (filesNewerThanOpenAi.length === 0) {
        Logger.info('No files are newer than their OpenAI counterparts');
        return;
      }

      for (const file of filesNewerThanOpenAi) {
        const fileUploadDTO = new FileUploadDTO(file.path);
        const uploadedFile: OpenAIFile | null = await OpenAIRepository.uploadFile(fileUploadDTO);

        if (!uploadedFile) {
          Logger.error(`Failed to upload file ${file.name}`);
          continue;
        }

        const createBatchDTO = new CreateBatchDTO(uploadedFile.id, file.name);
        const createdBatch = await OpenAIRepository.createBatch(createBatchDTO);

        if (!createdBatch) {
          Logger.error(`Failed to create batch for file ${file.name}`);
          continue;
        }

        Logger.info(`Batch created for file ${file.name}`);
      }
    } catch (error: any) {
      Logger.error(`${error.message}`);
      throw new AppError(`Error processing batches: ${error.message}`, 500);
    }
  }

  static getLocalFilesToUpload() {
    try {
      const localFiles = fs.readdirSync(AppConfig.sourceDirectory).map(file => ({
        name: file,
        path: path.join(AppConfig.sourceDirectory, file),
        lastModified: fs.statSync(path.join(AppConfig.sourceDirectory, file)).mtime.getTime(),
      }));

      return localFiles;
    } catch (error: any) {
      Logger.error(`${error.message}`);
      throw new AppError(`Error getting local files to upload: ${error.message}`, 500);
    }
  }

  static getFilesNewerThanOpenAi(localFiles: any[], openAiBatches: Batch[]) {
    const filesNewerThanOpenAi = localFiles
      .filter(localFile => localFile.name.endsWith('.jsonl')) // Filter for .jsonl files only
      .filter(localFile => {
        return openAiBatches.every(batch => {
          if (batch.input_file_id && batch.metadata && batch.metadata.fileName === localFile.name) {
            const openAiLastModified = batch.createdAt.getTime();
            return localFile.lastModified > openAiLastModified;
          }
          return true; // No matching OpenAI batch, consider it as newer
        });
      });

    return filesNewerThanOpenAi;
  }

  static async downloadBatchResults() {
    try {
      const batches = await OpenAIRepository.listBatches();
      if (!batches || batches.length === 0) {
        Logger.info('OpenAI Batches list is empty');
        return;
      }

      for (const batch of batches) {
        if (batch.isCompleted()) {
          const results : any = await OpenAIRepository.downloadResults(batch.output_file_id);
          fs.writeFileSync(path.join(AppConfig.targetDirectory, 'results.jsonl'), results);
          Logger.info( 'Results downloaded successfully.');
        }
      }
    } catch (error: any) {
      Logger.error(`${error.message}`);
      throw new AppError(`Error downloading batch results: ${error.message}`, 500);
    }
  }


  // Create a .jsonl file for the batch, used for testing purposes
  static createJsonlFile(files: any[], outputFilePath: string) {
    try {
      const jsonlContent = files.map((file, index) => {
        return JSON.stringify({
          custom_id: `request-${index + 1}`,
          method: 'POST',
          url: '/v1/chat/completions',
          body: {
            model: 'gpt-3.5-turbo-0125',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `What is AWS` },
            ],
            max_tokens: 1000,
          },
        });
      }).join('\n');

      fs.writeFileSync(outputFilePath, jsonlContent);
      Logger.info(`.jsonl file created at ${outputFilePath}`);
    } catch (error: any) {
      throw new AppError(`Error creating .jsonl file: ${error.message}`, 500);
    }
  }
}
