import { Result, UseCase, injectable } from '@alien-worlds/aw-core';

import { AtomicAsset } from '@alien-worlds/aw-api-common-atomicassets';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { MinigToolData } from '../../data/leaderboard.dtos';

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
      luck,
      ease,
      delay,
      miningCounter,
    } = update;
    const toolsUsed = [];

    let totalToolChargeTime = 0;
    let avgToolChargeTime = 0;
    let totalToolMiningPower = 0;
    let totalToolNftPower = 0;
    let avgNftPower = 0;
    let avgToolMiningPower = 0;
    let avgToolNftPower = 0;
    let avgChargeTime = 0;
    let avgMiningPower = 0;

    assets.forEach(asset => {
      const { assetId, data } = asset;

      if (bagItems.includes(assetId)) {
        toolsUsed.push(assetId);
        totalToolChargeTime += data.delay || 0;
        totalToolMiningPower += data.ease || 0;
        totalToolNftPower += data.luck || 0;
      }
    });

    const toolsCount = toolsUsed.length;
    const totalMiningPower = ease;
    const totalNftPower = luck;
    const totalChargeTime = delay;

    if (toolsCount > 0) {
      avgChargeTime = totalChargeTime;
      avgMiningPower = totalMiningPower;
      avgNftPower = totalNftPower;
      avgToolChargeTime = totalToolChargeTime;
      avgToolMiningPower = totalToolMiningPower;
      avgToolNftPower = totalToolNftPower;
    }

    const leaderboard = Leaderboard.create(
      miningCounter,
      blockNumber,
      blockTimestamp,
      walletId,
      username,
      bounty,
      bounty,
      points,
      totalToolChargeTime,
      avgToolChargeTime,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      totalToolMiningPower,
      avgToolMiningPower,
      totalToolNftPower,
      avgToolNftPower,
      landId ? [landId] : [],
      planetName ? [planetName] : [],
      toolsUsed
    );
    return Result.withContent(leaderboard);
  }
}
