import { Result, UseCase, injectable } from '@alien-worlds/aw-core';

import { AtomicAsset } from '@alien-worlds/aw-api-common-atomicassets';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { nanoid } from 'nanoid';

/**
 * @class
 */
@injectable()
export class UpdateUserLeaderboardUseCase implements UseCase<Leaderboard> {
  public static Token = 'UPDATE_USER_LEADERBOARD_USE_CASE';

  /**
   * @async
   */
  public async execute(
    current: Leaderboard,
    update: LeaderboardUpdate,
    assets: AtomicAsset<MinigToolData>[] = []
  ): Promise<Result<Leaderboard>> {
    const points = update.points || 0;
    const bounty = update.bounty || 0;
    const ease = update.ease || 0;
    const luck = update.luck || 0;
    const delay = update.delay || 0;

    const toolsUsed: bigint[] = current.toolsUsed || [];
    const lands = current.lands;
    const planets = current.planets;
    let miningCounter = current.miningCounter;
    let totalToolChargeTime = current.totalToolChargeTime;
    let totalChargeTime = current.totalChargeTime;
    let totalMiningPower = current.totalMiningPower;
    let totalNftPower = current.totalNftPower;
    let totalToolMiningPower = current.totalToolMiningPower;
    let totalToolNftPower = current.totalToolNftPower;

    if (update.miningCounter > 0) {
      miningCounter += update.miningCounter;
    }

    if (update.planetName && planets.indexOf(update.planetName) === -1) {
      planets.push(update.planetName);
    }

    if (update.landId && lands.indexOf(update.landId) === -1) {
      lands.push(update.landId);
    }

    assets.forEach(asset => {
      const { assetId, data } = asset;

      if (
        toolsUsed.indexOf(assetId) === -1 &&
        update.bagItems.includes(assetId)
      ) {
        toolsUsed.push(assetId);
        totalToolChargeTime += data.delay;
        totalToolMiningPower += data.ease;
        totalToolNftPower += data.luck;
      }
    });

    totalChargeTime += delay;
    totalMiningPower += ease;
    totalNftPower += luck;

    const toolsCount = toolsUsed.length;

    const avgToolChargeTime =
      toolsCount && miningCounter && totalToolChargeTime
        ? totalToolChargeTime / miningCounter
        : current.avgToolChargeTime ?? 0;

    const avgChargeTime =
      miningCounter && totalChargeTime
        ? totalChargeTime / miningCounter
        : current.avgChargeTime ?? 0;

    const avgMiningPower =
      miningCounter && totalMiningPower
        ? totalMiningPower / miningCounter
        : current.avgMiningPower ?? 0;

    const avgNftPower =
      miningCounter && totalNftPower
        ? totalNftPower / miningCounter
        : current.avgNftPower ?? 0;

    const avgToolMiningPower =
      toolsCount && miningCounter && totalToolMiningPower
        ? totalToolMiningPower / miningCounter
        : current.avgToolMiningPower ?? 0;

    const avgToolNftPower =
      toolsCount && miningCounter && totalToolNftPower
        ? totalToolNftPower / miningCounter
        : current.avgToolNftPower ?? 0;

    const leaderboard = Leaderboard.create(
      miningCounter,
      update.blockNumber,
      update.blockTimestamp,
      update.walletId,
      update.username || current.username,
      current.tlmGainsTotal + bounty,
      current.tlmGainsHighest < bounty ? bounty : current.tlmGainsHighest,
      current.totalNftPoints + points,
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
      lands,
      planets,
      toolsUsed,
      {},
      nanoid()
    );
    return Result.withContent(leaderboard);
  }
}
