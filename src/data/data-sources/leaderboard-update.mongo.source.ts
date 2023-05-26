import {
  CollectionMongoSource,
  DataSourceOperationError,
  MongoSource,
} from '@alien-worlds/api-core';
import { LeaderboardUpdateDocument } from '../leaderboard.dtos';

/*imports*/

/**
 * @class
 */
export class LeaderboardUpdateMongoSource extends CollectionMongoSource<LeaderboardUpdateDocument> {
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
      throw DataSourceOperationError.fromError(error);
    }
  }
}
