import { Failure, OperationStatus, Result } from '@alien-worlds/aw-core';

import { Leaderboard } from '../../domain/entities/leaderboard';
import { LeaderboardArchiveMongoSource } from '../data-sources/leaderboard-archive.mongo.source';
import { LeaderboardRankingsRedisSource } from '../data-sources/leaderboard-rankings.redis.source';
import { LeaderboardRepository } from '../../domain/repositories/leaderboard.repository';
import { LeaderboardSnapshotMongoSource } from '../data-sources/leaderboard-snapshot.mongo.source';

export class LeaderboardRepositoryImpl implements LeaderboardRepository {
  constructor(
    protected readonly archiveSource: LeaderboardArchiveMongoSource,
    protected readonly snapshotSource: LeaderboardSnapshotMongoSource,
    protected readonly rankingsSource: LeaderboardRankingsRedisSource,
    protected readonly archiveBatchSize: number
  ) { }

  public async findUsers(
    wallets: string[],
    includeRankings: boolean,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[], Error>> {
    const { rankingsSource, archiveSource, snapshotSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const snapshots = await snapshotSource.find({
          filter: { wallet_id: { $in: wallets } },
        });

        if (includeRankings) {
          const rankings = await rankingsSource.getRankings(wallets);
          Object.keys(rankings).forEach(key => {
            const snapshot = snapshots.find(
              document => document.wallet_id === key
            );
            if (snapshot) {
              snapshot.rankings = rankings[key];
            }
          });
        }
        return Result.withContent(snapshots.map(Leaderboard.fromDocument));
      }

      const documents = await archiveSource.find({
        filter: {
          $and: [
            {
              last_block_timestamp: {
                $gte: new Date(fromDate.toISOString()),
                $lt: new Date(toDate.toISOString()),
              },
            },
            {
              wallet_id: { $in: wallets },
            },
          ],
        },
      });

      return Result.withContent(documents.map(Leaderboard.fromDocument));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async list(
    sort: string,
    offset: number,
    limit: number,
    order: number,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[]>> {
    const { rankingsSource, archiveSource, snapshotSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const rankings = await rankingsSource.list({
          sort,
          offset,
          limit,
          order,
        });
        const wallets = rankings.map(ranking => ranking.wallet_id);
        const snapshots = await snapshotSource.find({
          filter: { wallet_id: { $in: wallets } },
        });

        snapshots.forEach(snapshot => {
          snapshot.rankings =
            rankings.find(rank => rank.wallet_id === snapshot.wallet_id)
              ?.rankings || {};
        });

        return Result.withContent(snapshots.map(Leaderboard.fromDocument));
      }

      const documents = await archiveSource.find({
        filter: {
          last_block_timestamp: {
            $gte: new Date(fromDate.toISOString()),
            $lt: new Date(toDate.toISOString()),
          },
        },
        options: {
          sort: JSON.parse(`{ "${sort}": ${order || -1} }`),
          skip: Number(offset),
          limit: Number(limit),
        },
      });

      return Result.withContent(documents.map(Leaderboard.fromDocument));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async count(
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<number, Error>> {
    const { rankingsSource, archiveSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const size = await rankingsSource.count();
        return Result.withContent(size);
      }

      const size = await archiveSource.count({
        filter: {
          last_block_timestamp: {
            $gte: new Date(fromDate.toISOString()),
            $lt: new Date(toDate.toISOString()),
          },
        },
      });

      return Result.withContent(size);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async update(
    leaderboards: Leaderboard[]
  ): Promise<Result<OperationStatus.Success | OperationStatus.Failure>> {
    try {
      const { rankingsSource, snapshotSource } = this;
      const structs = leaderboards.map(leaderboard => leaderboard.toJson());
      const documents = leaderboards.map(leaderboard => {
        {
          const doc = leaderboard.toDocument();

          const filter = { wallet_id: doc.wallet_id };
          const update = { $set: { ...doc }, };
          return {
            updateOne: {
              filter: filter,
              update: update,
              upsert: true
            }
          };
        }
      });

      await Promise.all([
        rankingsSource.update(structs),
        snapshotSource.update(documents),
      ]);

      return Result.withContent(OperationStatus.Success);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
