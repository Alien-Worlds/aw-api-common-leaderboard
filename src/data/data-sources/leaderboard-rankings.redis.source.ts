import { log, OperationStatus } from '@alien-worlds/aw-core';
import {
  RedisSortedSetCollectionSource,
  RedisSource,
} from '@alien-worlds/aw-storage-redis';

import { LeaderboardSort } from '../../domain/leaderboard.enums';
import {
  LeaderboardJson,
  LeaderboardUserRankingsJson,
  LeaderboardUserScoresJson,
} from '../leaderboard.dtos';

/**
 * @class
 */
export class LeaderboardRankingsRedisSource {
  private collections = new Map<string, RedisSortedSetCollectionSource>();

  /**
   * @constructor
   * @param {RedisSource} redisSource
   */
  constructor(redisSource: RedisSource, private prefix: string) {
    this.collections.set(
      LeaderboardSort.TlmGainsTotal,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.TlmGainsTotal}`
      )
    );

    this.collections.set(
      LeaderboardSort.TotalNftPoints,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.TotalNftPoints}`
      )
    );
    this.collections.set(
      LeaderboardSort.UniqueToolsUsed,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.UniqueToolsUsed}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgToolChargeTime,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgToolChargeTime}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgChargeTime,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgChargeTime}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgMiningPower,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgMiningPower}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgNftPower,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgNftPower}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgToolMiningPower,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgToolMiningPower}`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgToolNftPower,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.AvgToolNftPower}`
      )
    );
    this.collections.set(
      LeaderboardSort.LandsMinedOn,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.LandsMinedOn}`
      )
    );
    this.collections.set(
      LeaderboardSort.PlanetsMinedOn,
      new RedisSortedSetCollectionSource(
        redisSource,
        `${prefix}_${LeaderboardSort.PlanetsMinedOn}`
      )
    );
  }

  public async update(leaderboards: LeaderboardJson[]) {
    const tlmGainsTotal = [];
    const totalNftPoints = [];
    const uniqueToolsUsed = [];
    const avgToolChargeTime = [];
    const avgChargeTime = [];
    const avgMiningPower = [];
    const avgNftPower = [];
    const avgToolMiningPower = [];
    const avgToolNftPower = [];
    const landsMinedOn = [];
    const planetsMinedOn = [];

    for (const leaderboard of leaderboards) {
      const {
        wallet_id,
        tlm_gains_total,
        total_nft_points,
        avg_tool_charge_time,
        avg_charge_time,
        avg_mining_power,
        avg_nft_power,
        avg_tool_mining_power,
        avg_tool_nft_power,
        lands_mined_on,
        planets_mined_on,
        unique_tools_used,
      } = leaderboard;
      tlmGainsTotal.push({ score: tlm_gains_total, member: wallet_id });
      totalNftPoints.push({ score: total_nft_points, member: wallet_id });
      uniqueToolsUsed.push({ score: unique_tools_used, member: wallet_id });
      avgToolChargeTime.push({
        score: avg_tool_charge_time,
        member: wallet_id,
      });
      avgChargeTime.push({ score: avg_charge_time, member: wallet_id });
      avgMiningPower.push({ score: avg_mining_power, member: wallet_id });
      avgNftPower.push({ score: avg_nft_power, member: wallet_id });
      avgToolMiningPower.push({
        score: avg_tool_mining_power,
        member: wallet_id,
      });
      avgToolNftPower.push({ score: avg_tool_nft_power, member: wallet_id });
      landsMinedOn.push({ score: lands_mined_on, member: wallet_id });
      planetsMinedOn.push({ score: planets_mined_on, member: wallet_id });
    }

    console.log('LeaderboardSort.TlmGainsTotal -- ', tlmGainsTotal);

    this.collections.get(LeaderboardSort.TlmGainsTotal).insert(tlmGainsTotal);
    this.collections.get(LeaderboardSort.TotalNftPoints).insert(totalNftPoints);
    this.collections
      .get(LeaderboardSort.UniqueToolsUsed)
      .insert(uniqueToolsUsed);
    this.collections
      .get(LeaderboardSort.AvgToolChargeTime)
      .insert(avgToolChargeTime);
    this.collections.get(LeaderboardSort.AvgChargeTime).insert(avgChargeTime);
    this.collections.get(LeaderboardSort.AvgMiningPower).insert(avgMiningPower);
    this.collections.get(LeaderboardSort.AvgNftPower).insert(avgNftPower);
    this.collections
      .get(LeaderboardSort.AvgToolMiningPower)
      .insert(avgToolMiningPower);
    this.collections
      .get(LeaderboardSort.AvgToolNftPower)
      .insert(avgToolNftPower);
    this.collections.get(LeaderboardSort.LandsMinedOn).insert(landsMinedOn);
    this.collections.get(LeaderboardSort.PlanetsMinedOn).insert(planetsMinedOn);
  }

  public async getRankings(
    wallets: string[],
    keys?: LeaderboardSort[],
    order?: number
  ): Promise<LeaderboardUserRankingsJson> {
    const result = {};
    const promises = [];
    const rankKeys =
      Array.isArray(keys) && keys.length > 0
        ? keys
        : Object.values(LeaderboardSort);
    for (const walletId of wallets) {
      result[walletId] = {};
      for (const key of rankKeys) {
        if (this.collections.has(key)) {
          promises.push(
            this.collections
              .get(key)
              .getRank(walletId, order || -1)
              .then(rank => {
                result[walletId][key] = rank > -1 ? rank + 1 : -1;
              })
          );
        } else {
          log(`Unknown key: ${key}`);
        }
      }
      await Promise.all(promises);
    }
    return result;
  }

  public async getScores(
    wallets: string[],
    keys?: string[]
  ): Promise<LeaderboardUserScoresJson> {
    const props =
      Array.isArray(keys) && keys.length > 0
        ? keys
        : Object.values(LeaderboardSort);
    const result = {};
    for (const walletId of wallets) {
      result[walletId] = {};
      const promises = [];

      for (const prop of props) {
        promises.push(this.collections.get(prop).findOne(walletId));
      }

      const scores = await Promise.all(promises);

      scores.forEach((score, index) => {
        result[walletId][props[index]] = score;
      });
    }
    return result;
  }

  public async clear(): Promise<boolean> {
    const props = Object.values(LeaderboardSort);
    let success = true;

    for (const prop of props) {
      const result = await this.collections.get(prop).clear();
      if (result == OperationStatus.Failure) {
        log(`The collection of ${prop} has not been cleared.`);
        success = false;
      }
    }

    return success;
  }

  public async count(sort?: string): Promise<number> {
    return this.collections.get(sort || LeaderboardSort.TlmGainsTotal).count();
  }

  public async list(options: {
    sort: string;
    offset?: number;
    limit?: number;
    order?: number;
  }): Promise<LeaderboardJson[]> {
    const { sort } = options;
    const offset = options.offset || 0;
    const limit = options.limit || 10;
    const order = options.order || -1;

    if (this.collections.has(sort) === false) {
      return [];
    }

    const list = await this.collections.get(sort).list({
      offset,
      limit,
      order,
    });
    const wallets = list.map(doc => doc.member);
    const ranks = await this.getRankings(wallets);
    const jsons: LeaderboardJson[] = [];

    for (const item of list) {
      const { score, member: wallet_id } = item;
      const rank = ranks[wallet_id]?.[sort] || -1;
      jsons.push({
        wallet_id,
        [sort]: score,
        rankings: { [sort]: rank > -1 ? rank + 1 : -1 },
      });
    }

    return jsons;
  }
}
