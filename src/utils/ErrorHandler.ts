import { Logger } from '../utils/Logger';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: AppError, res: any) => {
  Logger.error(`${error.message}`);
  res.status(error.statusCode).json({ error: error.message });
};

export const handleApiError = (error: any) => {
  if (error.response) {
    const { status } = error.response;
    switch (status) {
      case 401:
        throw new AppError('Unauthorized: Check your API key or organization membership.', 401);
      case 403:
        throw new AppError('Forbidden: Access is not allowed from this region.', 403);
      case 429:
        throw new AppError('Rate limit exceeded or quota reached. Please check your plan or billing details.', 429);
      case 500:
        throw new AppError('Internal Server Error. Please try again later.', 500);
      case 503:
        throw new AppError('Service Unavailable: The engine is currently overloaded. Please try again later.', 503);
      default:
        throw new AppError(`Unexpected error occurred: ${error.message}`, status || 500);
    }
  } else if (error.request) {
    throw new AppError('No response received from OpenAI API. Please check your network connection.', 500);
  } else {
    throw new AppError(`Error in request setup: ${error.message}`, 500);
  }
};
