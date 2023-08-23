import { injectable, OperationStatus, Result } from '@alien-worlds/aw-core';

import { Leaderboard } from '../entities/leaderboard';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class LeaderboardRepository {
  public static Token = 'LEADERBOARD_REPOSITORY';

  public abstract findUsers(
    walletIds: string[],
    includeRankings: boolean,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[], Error>>;

  public abstract list(
    sort: string,
    offset: number,
    limit: number,
    order: number,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[]>>;

  public abstract update(
    leaderboards: Leaderboard[]
  ): Promise<Result<OperationStatus.Success | OperationStatus.Failure>>;

  public abstract count(
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<number, Error>>;
}
