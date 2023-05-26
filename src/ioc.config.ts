import { Container, MongoSource, RedisSource } from '@alien-worlds/api-core';
import { LeaderboardRepositoryImpl } from './data/repositories/leaderboard.repository-impl';
import { LeaderboardRankingsRedisSource } from './data/data-sources/leaderboard-rankings.redis.source';
import { LeaderboardArchiveMongoSource } from './data/data-sources/leaderboard-archive.mongo.source';
import { DailyLeaderboardRepository } from './domain/repositories/daily-leaderboard.repository';
import { WeeklyLeaderboardRepository } from './domain/repositories/weekly-leaderboard.repository';
import { MonthlyLeaderboardRepository } from './domain/repositories/monthly-leaderboard.repository';
import { CreateUserLeaderboardUseCase } from './domain/use-cases/create-user-leaderboard.use-case';
import { UpdateLeaderboardWithinTimeframeUseCase } from './domain/use-cases/update-leaderboard-within-timeframe.use-case';
import { UpdateLeaderboardUseCase } from './domain/use-cases/update-leaderboard.use-case';
import { UpdateUserLeaderboardUseCase } from './domain/use-cases/update-user-leaderboard.use-case';
import { LeaderboardSnapshotMongoSource } from './data/data-sources/leaderboard-snapshot.mongo.source';
import { LeaderboardConfig } from './leaderboard.types';

export const setupLeaderboard = async (
  config: LeaderboardConfig,
  mongo?: MongoSource,
  container?: Container
): Promise<void> => {
  let mongoSource: MongoSource;

  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(config.mongo);
  }

  const redisSource = await RedisSource.create(config.redis);

  const dailyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'daily'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'daily'),
    new LeaderboardRankingsRedisSource(redisSource, 'daily'),
    config.archiveBatchSize
  );

  const weeklyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'weekly'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'weekly'),
    new LeaderboardRankingsRedisSource(redisSource, 'weekly'),
    config.archiveBatchSize
  );

  const monthlyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'monthly'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'monthly'),
    new LeaderboardRankingsRedisSource(redisSource, 'monthly'),
    config.archiveBatchSize
  );

  if (container) {
    container
      .bind<DailyLeaderboardRepository>(DailyLeaderboardRepository.Token)
      .toConstantValue(dailyLeaderboardRepository);
    container
      .bind<WeeklyLeaderboardRepository>(WeeklyLeaderboardRepository.Token)
      .toConstantValue(weeklyLeaderboardRepository);
    container
      .bind<MonthlyLeaderboardRepository>(MonthlyLeaderboardRepository.Token)
      .toConstantValue(monthlyLeaderboardRepository);
    container
      .bind<CreateUserLeaderboardUseCase>(CreateUserLeaderboardUseCase.Token)
      .to(CreateUserLeaderboardUseCase);
    container
      .bind<UpdateLeaderboardWithinTimeframeUseCase>(
        UpdateLeaderboardWithinTimeframeUseCase.Token
      )
      .to(UpdateLeaderboardWithinTimeframeUseCase);
    container
      .bind<UpdateLeaderboardUseCase>(UpdateLeaderboardUseCase.Token)
      .to(UpdateLeaderboardUseCase);
    container
      .bind<UpdateUserLeaderboardUseCase>(UpdateUserLeaderboardUseCase.Token)
      .to(UpdateUserLeaderboardUseCase);
  }
};
