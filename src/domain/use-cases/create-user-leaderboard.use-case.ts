import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { AtomicAsset } from '@alien-worlds/atomicassets-api-common';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';

/*imports*/

/**
 * @class
 */
@injectable()
export class CreateUserLeaderboardUseCase implements UseCase<Leaderboard> {
  public static Token = 'CREATE_USER_LEADERBOARD_USE_CASE';

  /**
   * @async
   */
  public async execute(
    update: LeaderboardUpdate,
    assets: AtomicAsset<MinigToolData>[] = []
  ): Promise<Result<Leaderboard>> {
    const {
      walletId,
      username,
      bounty,
      blockNumber,
      blockTimestamp,
      points,
      landId,
      planetName,
      bagItems,
    } = update;
    const toolsUsed = [];
    let totalChargeTime = 0;
    let totalMiningPower = 0;
    let totalNftPower = 0;
    let avgChargeTime = 0;
    let avgMiningPower = 0;
    let avgNftPower = 0;

    assets.forEach(asset => {
      const {
        assetId,
        data: { ease, delay, difficulty },
      } = asset;

      if (bagItems.includes(assetId)) {
        toolsUsed.push(assetId);
        totalChargeTime += delay || 0;
        totalMiningPower += ease || 0;
        totalNftPower += difficulty || 0;
      }
    });
    const toolsCount = toolsUsed.length;

    if (toolsCount > 0) {
      avgChargeTime = totalChargeTime / toolsCount;
      avgMiningPower = totalMiningPower / toolsCount;
      avgNftPower = totalNftPower / toolsCount;
    }

    const leaderboard = Leaderboard.create(
      blockNumber,
      blockTimestamp,
      walletId,
      username,
      bounty,
      bounty,
      points,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      landId ? [landId] : [],
      planetName ? [planetName] : [],
      toolsUsed
    );
    return Result.withContent(leaderboard);
  }

  /*methods*/
}
