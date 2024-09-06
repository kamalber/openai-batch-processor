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
import { injectable } from 'tsyringe';


@injectable()
export class BatchService {
  constructor(private openAIRepository: OpenAIRepository) {}

   async processBatches() {
    try {
      const localFiles = this.getLocalFilesToUpload();
      if (localFiles.length === 0) {
        Logger.warn('No files are in the source repository to be processed');
        return;
      }

      const openAiBatches = await this.openAIRepository.listBatches();
      if (!openAiBatches || openAiBatches.length === 0) {
        Logger.info('OpenAI Batches list is empty');
        return;
      }

      const filesNewerThanOpenAi = this.getFilesNewerThanOpenAi(localFiles, openAiBatches);
      if (filesNewerThanOpenAi.length === 0) {
        Logger.info('No files are newer than their OpenAI counterparts');
        return;
      }

      const uploadPromises = filesNewerThanOpenAi.map(file => this.uploadAndBatchFile(file));

      await Promise.all(uploadPromises);

    } catch (error: any) {
      Logger.error(`Error in batch processing: ${error.message}`);
      throw new AppError(`Batch processing failed: ${error.message}`, 500);
    }
  }

  // Create batch from file
  private  async uploadAndBatchFile(file: any) {
    try {
      const fileUploadDTO = new FileUploadDTO(file.path);
      const uploadedFile = await this.openAIRepository.uploadFile(fileUploadDTO);

      if (!uploadedFile) {
        Logger.error(`Failed to upload file ${file.name}`);
        return;
      }

      const createBatchDTO = new CreateBatchDTO(uploadedFile.id, file.name);
      const createdBatch = await this.openAIRepository.createBatch(createBatchDTO);

      if (!createdBatch) {
        Logger.error(`Failed to create batch for file ${file.name}`);
      } else {
        Logger.info(`Batch successfully created for file ${file.name}`);
      }
    } catch (error: any) {
      Logger.error(`Error processing file ${file.name}: ${error.message}`);
    }
  }


  // Get files that are newer than their OpenAI counterparts
 private  getFilesNewerThanOpenAi(localFiles: any[], openAiBatches: Batch[]) {
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

  // Get all local files from the source directory
  private  getLocalFilesToUpload() {
    return fs.readdirSync(AppConfig.sourceDirectory).map(fileName => {
      const filePath = path.join(AppConfig.sourceDirectory, fileName);
      const stats = fs.statSync(filePath);
      return { name: fileName, path: filePath, lastModified: stats.mtimeMs };
    });
  }


    // Download batch results
     async downloadBatchResults() {
      try {
        const batches = await this.openAIRepository.listBatches();
        if (!batches || batches.length === 0) {
          Logger.info('No completed OpenAI batches found for downloading results.');
          return;
        }

        const downloadPromises = batches.map(async (batch) => {
          if (batch.isCompleted()) {
            try {
              const results = await this.openAIRepository.downloadResults(batch.output_file_id);
              if (!results || results.length === 0) {
                Logger.info('No results.');
                return;
              }
              const resultFilePath = path.join(AppConfig.targetDirectory, `results-${batch.id}.jsonl`);
              fs.writeFileSync(resultFilePath, results);
              Logger.info(`Results for batch ${batch.id} downloaded successfully.`);
            } catch (error: any) {
              Logger.error(`Error downloading results for batch ${batch.id}: ${error.message}`);
            }
          }
        });

        await Promise.all(downloadPromises);
      } catch (error: any) {
        Logger.error(`Error downloading batch results: ${error.message}`);
        throw new AppError(`Error downloading batch results: ${error.message}`, 500);
      }
    }


  // Create a .jsonl file for the batch, used for testing purposes
   createJsonlFile(files: any[], outputFilePath: string) {
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
