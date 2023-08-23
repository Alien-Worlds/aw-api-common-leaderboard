import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';
import { RedisConfig } from '@alien-worlds/aw-storage-redis';

export type LeaderboardConfig = {
  mongo: MongoConfig;
  redis: RedisConfig;
  archiveBatchSize?: number;
  updateBatchSize?: number;
  tlmDecimalPrecision?: number;
};
