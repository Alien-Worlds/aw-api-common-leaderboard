import { injectable } from '@alien-worlds/api-core';
import { LeaderboardRepository } from './leaderboard.repository';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class DailyLeaderboardRepository extends LeaderboardRepository {
  public static Token = 'DAILY_LEADERBOARD_REPOSITORY';
}
