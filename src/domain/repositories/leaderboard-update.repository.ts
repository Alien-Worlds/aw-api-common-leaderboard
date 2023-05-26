import { Result, injectable } from '@alien-worlds/api-core';
import { LeaderboardUpdate } from '../entities/leaderboard-update';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class LeaderboardUpdateRepository {
  public static Token = 'LEADERBOARD_UPDATE_REPOSITORY';

  public abstract add(updates: LeaderboardUpdate[]): Promise<Result>;
  public abstract next(): Promise<Result<LeaderboardUpdate>>;
  public abstract count(): Promise<Result<number>>;
}
