import {
  log,
  RedisSource,
  SortedCollectionRedisSource,
} from '@alien-worlds/api-core';
import {
  LeaderboardJson,
  LeaderboardUserRankingsJson,
  LeaderboardUserScoresJson,
} from '../leaderboard.dtos';
import { LeaderboardSort } from '../../domain/leaderboard.enums';

/**
 * @class
 */
export class LeaderboardRankingsRedisSource {
  private collections = new Map<string, SortedCollectionRedisSource>();

  /**
   * @constructor
   * @param {RedisSource} redisSource
   */
  constructor(redisSource: RedisSource, private prefix: string) {
    this.collections.set(
      LeaderboardSort.TlmGainsTotal,
      new SortedCollectionRedisSource(redisSource, `${prefix}_tlm_gains_total`)
    );

    this.collections.set(
      LeaderboardSort.TotalNftPoints,
      new SortedCollectionRedisSource(redisSource, `${prefix}_total_nft_points`)
    );
    this.collections.set(
      LeaderboardSort.UniqueToolsUsed,
      new SortedCollectionRedisSource(
        redisSource,
        `${prefix}_unique_tools_used`
      )
    );
    this.collections.set(
      LeaderboardSort.AvgChargeTime,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_charge_time`)
    );
    this.collections.set(
      LeaderboardSort.AvgMiningPower,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_mining_power`)
    );
    this.collections.set(
      LeaderboardSort.AvgNftPower,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_nft_power`)
    );
    this.collections.set(
      LeaderboardSort.LandsMinedOn,
      new SortedCollectionRedisSource(redisSource, `${prefix}_lands_mined_on`)
    );
    this.collections.set(
      LeaderboardSort.PlanetsMinedOn,
      new SortedCollectionRedisSource(redisSource, `${prefix}_planets_mined_on`)
    );
  }

  public async update(leaderboards: LeaderboardJson[]) {
    const tlmGainsTotal = [];
    const totalNftPoints = [];
    const uniqueToolsUsed = [];
    const avgChargeTime = [];
    const avgMiningPower = [];
    const avgNftPower = [];
    const landsMinedOn = [];
    const planetsMinedOn = [];

    for (const leaderboard of leaderboards) {
      const {
        wallet_id,
        tlm_gains_total,
        total_nft_points,
        avg_charge_time,
        avg_mining_power,
        avg_nft_power,
        lands_mined_on,
        planets_mined_on,
        unique_tools_used,
      } = leaderboard;
      tlmGainsTotal.push({ score: tlm_gains_total, value: wallet_id });
      totalNftPoints.push({ score: total_nft_points, value: wallet_id });
      uniqueToolsUsed.push({ score: unique_tools_used, value: wallet_id });
      avgChargeTime.push({ score: avg_charge_time, value: wallet_id });
      avgMiningPower.push({ score: avg_mining_power, value: wallet_id });
      avgNftPower.push({ score: avg_nft_power, value: wallet_id });
      landsMinedOn.push({ score: lands_mined_on, value: wallet_id });
      planetsMinedOn.push({ score: planets_mined_on, value: wallet_id });
    }

    this.collections.get(LeaderboardSort.TlmGainsTotal).addMany(tlmGainsTotal);
    this.collections
      .get(LeaderboardSort.TotalNftPoints)
      .addMany(totalNftPoints);
    this.collections
      .get(LeaderboardSort.UniqueToolsUsed)
      .addMany(uniqueToolsUsed);
    this.collections.get(LeaderboardSort.AvgChargeTime).addMany(avgChargeTime);
    this.collections
      .get(LeaderboardSort.AvgMiningPower)
      .addMany(avgMiningPower);
    this.collections.get(LeaderboardSort.AvgNftPower).addMany(avgNftPower);
    this.collections.get(LeaderboardSort.LandsMinedOn).addMany(landsMinedOn);
    this.collections
      .get(LeaderboardSort.PlanetsMinedOn)
      .addMany(planetsMinedOn);
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
        promises.push(this.collections.get(prop).getScore(walletId));
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
      if (result === false) {
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

    const list = await this.collections.get(sort).list(offset, limit, order);
    const wallets = list.map(json => json.value);
    const scores = await this.getScores(wallets);
    const jsons = [];

    for (const item of list) {
      const { rank, value } = item;
      const json: LeaderboardJson = scores[value];
      json.wallet_id = value;
      json.rankings = { [sort]: rank > -1 ? rank + 1 : -1 };
      jsons.push(json);
    }

    return jsons;
  }
}
