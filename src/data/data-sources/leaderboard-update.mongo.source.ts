import { MongoCollectionSource, MongoSource } from '@alien-worlds/aw-storage-mongodb';

import { DataSourceError } from '@alien-worlds/aw-core';
import { LeaderboardUpdateDocument } from '../leaderboard.dtos';

/**
 * @class
 */
export class LeaderboardUpdateMongoSource extends MongoCollectionSource<LeaderboardUpdateDocument> {
  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'leaderboard_updates', {
      indexes: [
        {
          key: {
            wallet_id: 1,
            update_id: 1,
          },
          unique: true,
          background: true,
        },
      ],
    });
  }

  public async nextUpdate(): Promise<LeaderboardUpdateDocument> {
    try {
      const result = await this.collection.findOneAndDelete({});
      return result.value;
    } catch (error) {
      throw DataSourceError.createError(error);
    }
  }
}
