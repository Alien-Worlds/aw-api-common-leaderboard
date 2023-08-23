/* eslint-disable @typescript-eslint/no-unused-vars */
import { MongoCollectionSource, MongoSource } from '@alien-worlds/aw-storage-mongodb';

import { LeaderboardDocument } from '../leaderboard.dtos';

/**
 * @class
 */
export class LeaderboardSnapshotMongoSource extends MongoCollectionSource<LeaderboardDocument> {
  public static Token = 'LEADERBOARD_SNAPSHOT_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource, name: string) {
    const parsedName = name.replace(/[ -.]+/g, '_');
    if (/^[a-zA-Z0-9_]+$/.test(parsedName) === false) {
      throw new Error(
        `Invalid leaderboard collection name "${name}". Please use only: a-zA-Z0-9_`
      );
    }
    super(mongoSource, `leaderboard_snapshot_${name}`, {
      indexes: [
        { key: { username: 1 }, background: true },
        {
          key: { tlm_gains_total: 1 },
          background: true,
        },
        {
          key: { tlm_gains_highest: 1 },
          background: true,
        },
        {
          key: { total_nft_points: 1 },
          background: true,
        },
        {
          key: { avg_charge_time: 1 },
          background: true,
        },
        {
          key: { avg_mining_power: 1 },
          background: true,
        },
        {
          key: { avg_nft_power: 1 },
          background: true,
        },
        {
          key: { lands_mined_on: 1 },
          background: true,
        },
        {
          key: { planets_mined_on: 1 },
          background: true,
        },
        {
          key: {
            wallet_id: 1,
          },
          unique: true,
          background: true,
        },
      ],
    });
  }
}
