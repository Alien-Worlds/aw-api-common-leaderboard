import { nanoid } from 'nanoid';
import {
  removeUndefinedProperties,
  MongoDB,
  parseToBigInt,
} from '@alien-worlds/api-core';
import {
  LeaderboardUpdateDocument,
  LeaderboardUpdateJson,
} from '../../data/leaderboard.dtos';
import { floatToPreciseInt } from '../../leaderboard.utils';
import {
  FederationContract,
  NotifyWorldContract,
  UsptsWorldsContract,
} from '@alien-worlds/alienworlds-api-common';

/**
 * @class
 */
export class LeaderboardUpdate {
  public static fromDocument(
    document: LeaderboardUpdateDocument
  ): LeaderboardUpdate {
    const {
      _id,
      mining_counter,
      wallet_id,
      username,
      bounty,
      block_number,
      block_timestamp,
      points,
      ease,
      luck,
      difficulty,
      delay,
      land_id,
      planet_name,
      bag_items,
      update_id,
    } = document;

    return new LeaderboardUpdate(
      parseToBigInt(block_number),
      block_timestamp,
      wallet_id,
      username,
      bounty,
      points,
      ease,
      luck,
      difficulty,
      delay,
      land_id ? parseToBigInt(land_id) : null,
      planet_name,
      bag_items ? bag_items.map(parseToBigInt) : null,
      update_id,
      _id instanceof MongoDB.ObjectId ? _id.toString() : null,
      mining_counter
    );
  }

  public static fromLogmineJson(
    blockNumber: string | number | bigint,
    blockTimestamp: Date,
    json: NotifyWorldContract.Actions.Types.LogmineStruct,
    decimalPrecision = 4
  ): LeaderboardUpdate {
    const { miner, land_id, planet_name, bag_items, params } = json;
    const { ease, luck, difficulty, delay } = params;
    const bounty = json.bounty
      ? json.bounty.match(/[+-]?\d+(\.\d+)?/g).map(parseFloat)[0]
      : 0;

    return new LeaderboardUpdate(
      parseToBigInt(blockNumber),
      blockTimestamp,
      miner,
      '',
      floatToPreciseInt(bounty, decimalPrecision),
      0,
      ease,
      luck,
      difficulty,
      delay,
      parseToBigInt(land_id),
      planet_name,
      bag_items.map(parseToBigInt),
      nanoid(),
      '',
      1
    );
  }

  public static fromJson(
    json: LeaderboardUpdateJson,
    decimalPrecision = 4
  ): LeaderboardUpdate {
    const {
      mining_counter,
      wallet_id,
      block_number,
      block_timestamp,
      username,
      bounty,
      points,
      ease,
      luck,
      difficulty,
      delay,
      land_id,
      planet_name,
      bag_items,
      update_id,
      id,
    } = json;

    return new LeaderboardUpdate(
      block_number ? parseToBigInt(block_number) : null,
      block_timestamp ? new Date(block_timestamp) : null,
      wallet_id,
      username,
      bounty ? floatToPreciseInt(bounty, decimalPrecision) : 0,
      Number(points),
      ease,
      luck,
      difficulty,
      delay,
      land_id ? parseToBigInt(land_id) : null,
      planet_name,
      Array.isArray(bag_items) ? bag_items.map(parseToBigInt) : [],
      update_id || nanoid(),
      id,
      mining_counter
    );
  }

  /**
   * @constructor
   */
  protected constructor(
    public readonly blockNumber: bigint,
    public readonly blockTimestamp: Date,
    public readonly walletId: string,
    public readonly username: string,
    public readonly bounty: number,
    public readonly points: number,
    public readonly ease: number,
    public readonly luck: number,
    public readonly difficulty: number,
    public readonly delay: number,
    public readonly landId: bigint,
    public readonly planetName: string,
    public readonly bagItems: bigint[],
    public readonly updateId: string,
    public readonly id?: string,
    public readonly miningCounter?: number
  ) {}

  /**
   *
   * @returns {LeaderboardUpdateDocument}
   */
  public toDocument(): LeaderboardUpdateDocument {
    const {
      id,
      miningCounter: mining_counter,
      walletId,
      username,
      bounty,
      blockNumber,
      blockTimestamp,
      points,
      ease,
      luck,
      difficulty,
      delay,
      landId,
      planetName,
      bagItems: bag_items,
      updateId: update_id,
    } = this;

    const document: LeaderboardUpdateDocument = {
      block_number: MongoDB.Long.fromBigInt(blockNumber),
      block_timestamp: blockTimestamp,
      username,
      wallet_id: walletId,
      bounty,
      points,
      ease,
      luck,
      difficulty,
      delay,
      planet_name: planetName,
      update_id,
      mining_counter: mining_counter || 0,
    };

    if (landId) {
      document.land_id = MongoDB.Long.fromBigInt(landId);
    }

    if (bag_items) {
      document.bag_items = bag_items.map(tool => MongoDB.Long.fromBigInt(tool));
    }

    if (id && MongoDB.ObjectId.isValid(id)) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<LeaderboardUpdateDocument>(document);
  }

  public toJson(): LeaderboardUpdateJson {
    const {
      miningCounter: mining_counter,
      id,
      walletId,
      username,
      bounty,
      blockNumber,
      blockTimestamp,
      points,
      ease,
      luck,
      difficulty,
      delay,
      landId,
      planetName,
      bagItems: bag_items,
      updateId: update_id,
    } = this;

    const json: LeaderboardUpdateJson = {
      block_number: blockNumber.toString(),
      block_timestamp: blockTimestamp.toISOString(),
      username,
      wallet_id: walletId,
      bounty,
      points,
      ease,
      luck,
      difficulty,
      delay,
      planet_name: planetName,
      update_id,
      mining_counter: mining_counter || 0,
    };

    if (landId) {
      json.land_id = landId.toString();
    }

    if (bag_items) {
      json.bag_items = bag_items.map(tool => tool.toString());
    }

    if (id) {
      json.id = id;
    }

    return removeUndefinedProperties<LeaderboardUpdateJson>(json);
  }
}
