import { AppConfig } from './types';

// Helper to safely get environment variables
// Adapts to standard process.env usage for generic build tools
const getEnv = (key: string, defaultVal: string): string => {
  try {
    // @ts-ignore
    return process.env[key] || defaultVal;
  } catch {
    return defaultVal;
  }
};

const getBoolEnv = (key: string, defaultVal: boolean): boolean => {
  try {
    // @ts-ignore
    const val = process.env[key];
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    return defaultVal;
  } catch {
    return defaultVal;
  }
};

export const config: AppConfig = {
  // Timeweb or standard env vars usually map to REACT_APP_ or VITE_ prefix.
  // Removing trailing slash from default URL to prevent double slashes in API calls.
  baseUrl: getEnv('REACT_APP_BASE_URL', 'https://d5ddhd9aa11rddl8l66d.laqt4bj7.apigw.yandexcloud.net'),
  useMock: getBoolEnv('REACT_APP_USE_MOCK', false), // Default to true to prevent "Failed to fetch" errors
};