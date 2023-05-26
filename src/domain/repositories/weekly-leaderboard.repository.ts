import { injectable } from '@alien-worlds/api-core';
import { LeaderboardRepository } from './leaderboard.repository';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class WeeklyLeaderboardRepository extends LeaderboardRepository {
  public static Token = 'WEEKLY_LEADERBOARD_REPOSITORY';
}
