import { injectable } from '@alien-worlds/api-core';
import { LeaderboardRepository } from './leaderboard.repository';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class MonthlyLeaderboardRepository extends LeaderboardRepository {
  public static Token = 'MONTHLY_LEADERBOARD_REPOSITORY';
}
