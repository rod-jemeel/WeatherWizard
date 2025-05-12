import * as dotenv from 'dotenv-flow';
import { join } from 'path';
import { cwd } from 'process';

// Load environment variables
dotenv.config({
  path: join(cwd()),
});

export const config = {
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};

export const validateEnv = () => {
  const requiredEnvVars = [
    'OPENWEATHER_API_KEY',
    'OPENAI_API_KEY',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
    return false;
  }
  
  return true;
};
