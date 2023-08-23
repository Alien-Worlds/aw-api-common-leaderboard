import { AtomicAsset } from '@alien-worlds/atomicassets-api-common';
import { inject, injectable, OperationStatus, Result, UseCase } from '@alien-worlds/aw-core';

import { MinigToolData } from '../../data/leaderboard.dtos';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { LeaderboardUpdateError } from '../errors/leaderboard-update.error';
import { LeaderboardTimeframe } from '../leaderboard.enums';
import { UpdateLeaderboardWithinTimeframeUseCase } from './update-leaderboard-within-timeframe.use-case';

/*imports*/
/**
 * @class
 */
@injectable()
export class UpdateLeaderboardUseCase
  implements UseCase<OperationStatus.Success | OperationStatus.Failure>
{
  public static Token = 'UPDATE_LEADERBOARD_USE_CASE';

  constructor(
    @inject(UpdateLeaderboardWithinTimeframeUseCase.Token)
    private updateLeaderboardWithinTimeframeUseCase: UpdateLeaderboardWithinTimeframeUseCase
  ) { }

  /**
   * @async
   */
  public async execute(
    updates: LeaderboardUpdate[],
    assets?: AtomicAsset<MinigToolData>[]
  ): Promise<
    Result<OperationStatus.Success | OperationStatus.Failure, LeaderboardUpdateError>
  > {
    const [dailyUpdate, weeklyUpdate, monthlyUpdate] = await Promise.all([
      this.updateLeaderboardWithinTimeframeUseCase.execute(
        LeaderboardTimeframe.Daily,
        updates,
        assets
      ),
      this.updateLeaderboardWithinTimeframeUseCase.execute(
        LeaderboardTimeframe.Weekly,
        updates,
        assets
      ),
      this.updateLeaderboardWithinTimeframeUseCase.execute(
        LeaderboardTimeframe.Monthly,
        updates,
        assets
      ),
    ]);

    if (dailyUpdate.isFailure) {
      return Result.withFailure(dailyUpdate.failure);
    }

    if (weeklyUpdate.isFailure) {
      return Result.withFailure(weeklyUpdate.failure);
    }

    if (monthlyUpdate.isFailure) {
      return Result.withFailure(monthlyUpdate.failure);
    }

    return Result.withContent(OperationStatus.Success);
  }

  /*methods*/
}
