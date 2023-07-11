import {
  LeaderboardDocument,
  LeaderboardJson,
} from '../../data/leaderboard.dtos';
import {
  MongoDB,
  parseToBigInt,
  removeUndefinedProperties,
} from '@alien-worlds/api-core';

import { LeaderboardNumbers } from './../../data/leaderboard.dtos';
import { nanoid } from 'nanoid';
import { LeaderboardSort } from '../leaderboard.enums';

/**
 * @class
 */
export class Leaderboard {
  /**
   *
   * @static
   * @param {LeaderboardDocument} document
   * @returns {Leaderboard}
   */
  public static fromDocument(document: LeaderboardDocument): Leaderboard {
    const {
      _id,
      mining_counter,
      last_update_timestamp,
      last_update_id,
      last_block_number,
      last_block_timestamp,
      username,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used,
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands,
      planets,
      rankings,
    } = document;

    const rankingsMap = new Map<string, number>();

    if (rankings) {
      const keys = Object.keys(rankings);
      for (const key of keys) {
        rankingsMap.set(key, rankings[key]);
      }
    }

    return new Leaderboard(
      mining_counter,
      parseToBigInt(last_block_number),
      last_block_timestamp,
      wallet_id,
      username,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used ? tools_used.map(id => parseToBigInt(id)) : [],
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands ? lands.map(id => parseToBigInt(id)) : [],
      planets,
      last_update_timestamp ? new Date(last_update_timestamp) : new Date(),
      last_update_id,
      rankingsMap,
      _id instanceof MongoDB.ObjectId ? _id.toString() : ''
    );
  }

  public static fromJson(json: LeaderboardJson): Leaderboard {
    const {
      mining_counter,
      last_update_timestamp,
      last_update_id,
      last_block_number,
      last_block_timestamp,
      username,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used,
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands,
      planets,
      rankings,
    } = json;

    const rankingsMap = new Map<string, number>();

    if (rankings) {
      const keys = Object.keys(rankings);
      for (const key of keys) {
        rankingsMap.set(key, rankings[key]);
      }
    }

    return new Leaderboard(
      mining_counter,
      parseToBigInt(last_block_number),
      new Date(last_block_timestamp),
      wallet_id,
      username,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used ? tools_used.map(id => parseToBigInt(id)) : [],
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands ? lands.map(id => parseToBigInt(id)) : [],
      planets,
      last_update_timestamp ? new Date(last_update_timestamp) : new Date(),
      last_update_id,
      rankingsMap,
      ''
    );
  }

  public static create(
    miningCounter: number,
    blockNumber: bigint,
    blockTimestamp: Date,
    walletId: string,
    username: string,
    bounty: number,
    bountyHighest: number,
    points: number,
    totalToolChargeTime: number,
    avgToolChargeTime: number,
    totalChargeTime: number,
    avgChargeTime: number,
    totalMiningPower: number,
    avgMiningPower: number,
    totalNftPower: number,
    avgNftPower: number,
    totalToolMiningPower: number,
    avgToolMiningPower: number,
    totalToolNftPower: number,
    avgToolNftPower: number,
    lands: bigint[],
    planets: string[],
    assets: bigint[],
    rankings?: LeaderboardNumbers,
    lastUpdateId?: string
  ): Leaderboard {
    const rankingsMap = new Map<string, number>();
    const ranks = rankings || {};

    rankingsMap.set(
      LeaderboardSort.AvgToolChargeTime,
      ranks[LeaderboardSort.AvgToolChargeTime] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgChargeTime,
      ranks[LeaderboardSort.AvgChargeTime] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgMiningPower,
      ranks[LeaderboardSort.AvgMiningPower] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgNftPower,
      ranks[LeaderboardSort.AvgNftPower] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgToolMiningPower,
      ranks[LeaderboardSort.AvgToolMiningPower] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgToolNftPower,
      ranks[LeaderboardSort.AvgToolNftPower] || 0
    );
    rankingsMap.set(
      LeaderboardSort.LandsMinedOn,
      ranks[LeaderboardSort.LandsMinedOn] || 0
    );
    rankingsMap.set(
      LeaderboardSort.PlanetsMinedOn,
      ranks[LeaderboardSort.PlanetsMinedOn] || 0
    );
    rankingsMap.set(
      LeaderboardSort.TlmGainsTotal,
      ranks[LeaderboardSort.TlmGainsTotal] || 0
    );
    rankingsMap.set(
      LeaderboardSort.TotalNftPoints,
      ranks[LeaderboardSort.TotalNftPoints] || 0
    );
    rankingsMap.set(
      LeaderboardSort.UniqueToolsUsed,
      ranks[LeaderboardSort.UniqueToolsUsed] || 0
    );

    return new Leaderboard(
      miningCounter,
      blockNumber,
      blockTimestamp,
      walletId,
      username,
      Number(bounty) || 0,
      Number(bountyHighest || bounty) || 0,
      Number(points) || 0,
      assets,
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
      new Date(),
      lastUpdateId || nanoid(),
      rankingsMap,
      ''
    );
  }

  /**
   * @constructor
   */
  protected constructor(
    public readonly miningCounter: number,
    public readonly lastBlockNumber: bigint,
    public readonly lastBlockTimestamp: Date,
    public readonly walletId: string,
    public readonly username: string,
    public readonly tlmGainsTotal: number,
    public readonly tlmGainsHighest: number,
    public readonly totalNftPoints: number,
    public readonly toolsUsed: bigint[],
    public readonly totalToolChargeTime: number,
    public readonly avgToolChargeTime: number,
    public readonly totalChargeTime: number,
    public readonly avgChargeTime: number,
    public readonly totalMiningPower: number,
    public readonly avgMiningPower: number,
    public readonly totalNftPower: number,
    public readonly avgNftPower: number,
    public readonly totalToolMiningPower: number,
    public readonly avgToolMiningPower: number,
    public readonly totalToolNftPower: number,
    public readonly avgToolNftPower: number,
    public readonly lands: bigint[],
    public readonly planets: string[],
    public readonly lastUpdateTimestamp: Date,
    public readonly lastUpdateId: string,
    public readonly rankings: Map<string, number>,
    public readonly id: string
  ) {}

  public get uniqueToolsUsed(): number {
    return this.toolsUsed.length;
  }
  public get landsMinedOn(): number {
    return this.lands.length;
  }
  public get planetsMinedOn(): number {
    return this.planets.length;
  }

  /**
   *
   * @returns {LeaderboardDocument}
   */
  public toDocument(): LeaderboardDocument {
    const {
      id,
      miningCounter: mining_counter,
      lastUpdateTimestamp: last_update_timestamp,
      lastUpdateId: last_update_id,
      username,
      walletId: wallet_id,
      tlmGainsTotal: tlm_gains_total,
      tlmGainsHighest: tlm_gains_highest,
      totalNftPoints: total_nft_points,
      totalToolChargeTime: total_tool_charge_time,
      avgToolChargeTime: avg_tool_charge_time,
      totalChargeTime: total_charge_time,
      avgChargeTime: avg_charge_time,
      totalMiningPower: total_mining_power,
      avgMiningPower: avg_mining_power,
      totalNftPower: total_nft_power,
      avgNftPower: avg_nft_power,
      totalToolMiningPower: total_tool_mining_power,
      avgToolMiningPower: avg_tool_mining_power,
      totalToolNftPower: total_tool_nft_power,
      avgToolNftPower: avg_tool_nft_power,
      landsMinedOn: lands_mined_on,
      planetsMinedOn: planets_mined_on,
      uniqueToolsUsed: unique_tools_used,
      toolsUsed,
      lands,
      planets,
      rankings,
      lastBlockNumber,
      lastBlockTimestamp,
    } = this;

    const document: LeaderboardDocument = {
      mining_counter,
      last_update_timestamp,
      last_update_id,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands_mined_on,
      planets_mined_on,
      unique_tools_used,
      username,
      tools_used: toolsUsed.map(id => MongoDB.Long.fromBigInt(id)),
      lands: lands.map(land => MongoDB.Long.fromBigInt(land)),
      planets,
    };

    if (lastBlockNumber) {
      document.last_block_number = MongoDB.Long.fromBigInt(lastBlockNumber);
    }

    if (lastBlockTimestamp) {
      document.last_block_timestamp = lastBlockTimestamp;
    }

    if (rankings.size > 0) {
      document.rankings = {};
      rankings.forEach((value, key) => {
        document.rankings[key] = value;
      });
    }

    if (id && MongoDB.ObjectId.isValid(id)) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<LeaderboardDocument>(document);
  }

  public toJson(): LeaderboardJson {
    const {
      miningCounter: mining_counter,
      lastUpdateTimestamp,
      lastBlockNumber,
      lastBlockTimestamp,
      username,
      lastUpdateId: last_update_id,
      walletId: wallet_id,
      tlmGainsTotal: tlm_gains_total,
      tlmGainsHighest: tlm_gains_highest,
      totalNftPoints: total_nft_points,
      totalToolChargeTime: total_tool_charge_time,
      avgToolChargeTime: avg_tool_charge_time,
      totalChargeTime: total_charge_time,
      avgChargeTime: avg_charge_time,
      totalMiningPower: total_mining_power,
      avgMiningPower: avg_mining_power,
      totalNftPower: total_nft_power,
      avgNftPower: avg_nft_power,
      totalToolMiningPower: total_tool_mining_power,
      avgToolMiningPower: avg_tool_mining_power,
      totalToolNftPower: total_tool_nft_power,
      avgToolNftPower: avg_tool_nft_power,
      landsMinedOn: lands_mined_on,
      planetsMinedOn: planets_mined_on,
      uniqueToolsUsed: unique_tools_used,
      rankings,
      planets,
      lands,
    } = this;

    const struct: LeaderboardJson = {
      mining_counter,
      last_update_timestamp: lastUpdateTimestamp.toISOString(),
      last_update_id,
      username,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      total_tool_charge_time,
      avg_tool_charge_time,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      total_tool_mining_power,
      avg_tool_mining_power,
      total_tool_nft_power,
      avg_tool_nft_power,
      lands_mined_on,
      planets_mined_on,
      unique_tools_used,
      planets,
      lands: lands.map(land => land.toString()),
    };

    if (lastBlockNumber) {
      struct.last_block_number = lastBlockNumber.toString();
    }

    if (lastBlockTimestamp) {
      struct.last_block_timestamp = lastBlockTimestamp.toISOString();
    }

    if (rankings.size > 0) {
      struct.rankings = {};
      rankings.forEach((value, key) => {
        struct.rankings[key] = value;
      });
    }

    return removeUndefinedProperties<LeaderboardJson>(struct);
  }
}
