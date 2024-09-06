import dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModelVersion: process.env.OPENAI_MODEL_VERSION || 'gpt-4o-mini',
  sourceDirectory: process.env.SOURCE_DIRECTORY || './source_dir',
  targetDirectory: process.env.TARGET_DIRECTORY || './target_dir',
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.openai.com/v1',
  rateLimit: {
    maxRequestsPerMinute: 20,
  },
};
