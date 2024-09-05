
import { AppError } from '../utils/ErrorHandler';


// Function to wrap API calls with rate limiting logic
export const RateLimiterMiddleware = async (fn: Function, ...args: any[]) => {
  try {
    //  to be added in the future, not for batch apis calls, but for other apis calls like file upload api
    return await fn(...args);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 429) {
      throw new AppError('Rate limit exceeded. Please try again later.', 429);
    }
    throw error;
  }
};
