import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { AppConfig } from '../types';

function resolveEnvVariables(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{(\w+)\}/g, (_, envVar) => {
      const val = process.env[envVar];
      if (val === undefined || val === '') {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
      return val;
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVariables);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveEnvVariables(value);
    }
    return result;
  }
  return obj;
}

export function loadConfig(configPath?: string): AppConfig {
  const defaultPath = path.resolve(process.cwd(), 'config.yaml');
  const filePath = configPath || defaultPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rawConfig = yaml.load(fileContent) as Record<string, unknown>;
  const config = resolveEnvVariables(rawConfig) as AppConfig;

  return config;
}

export const config = loadConfig();
