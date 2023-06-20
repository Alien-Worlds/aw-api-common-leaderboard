import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { AtomicAsset } from '@alien-worlds/atomicassets-api-common';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';

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
    } = update;
    const toolsUsed = [];
    let totalChargeTime = 0;
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
        totalChargeTime += data.delay || 0;
        totalToolMiningPower += data.ease || 0;
        totalToolNftPower += data.luck || 0;
      }
    });

    const toolsCount = toolsUsed.length;
    const totalMiningPower = ease;
    const totalNftPower = luck;
    
    if (toolsCount > 0) {
      avgChargeTime = totalChargeTime / toolsCount;
      avgMiningPower = totalMiningPower / toolsCount;
      avgNftPower = totalNftPower / toolsCount;
      avgToolMiningPower = totalToolMiningPower / toolsCount;
      avgToolNftPower = totalToolNftPower / toolsCount;
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
