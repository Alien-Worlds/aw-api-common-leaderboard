import { MongoConfig, RedisConfig } from '@alien-worlds/api-core';

export type LeaderboardConfig = {
  mongo: MongoConfig;
  redis: RedisConfig;
  archiveBatchSize?: number;
  updateBatchSize?: number;
  tlmDecimalPrecision?: number;
};
