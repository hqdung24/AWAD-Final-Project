import * as joi from 'joi';

export const environmentValidationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: joi.number().default(3000),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().default(5432),
  DB_USER: joi.string().required(),
  DB_PASS: joi.string().required(),
  DB_NAME: joi.string().required(),
  S3_BUCKET: joi.string().required(),
  GOOGLE_CLIENT_ID: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  JWT_AUDIENCE: joi.string().required(),
  JWT_ISSUER: joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: joi.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: joi.number().default(2920000),
  API_VERSION: joi.string().default('0.0.1'),
  // Redis
  REDIS_HOST: joi.string().default('localhost'),
  REDIS_PORT: joi.number().default(6379),
  REDIS_URL: joi.string().uri().optional(),
  REDIS_TTL: joi.number().default(60),
});
