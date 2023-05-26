import { Failure, Result, log } from '@alien-worlds/api-core';
import { LeaderboardUpdateRepository } from '../../domain/repositories/leaderboard-update.repository';
import { LeaderboardUpdate } from '../../domain/entities/leaderboard-update';
import { LeaderboardUpdateMongoSource } from '../data-sources/leaderboard-update.mongo.source';
import { LeaderboardUpdateNotFoundError } from '../../domain/errors/leaderboard-update-not-found.error';

export class LeaderboardUpdateRepositoryImpl implements LeaderboardUpdateRepository {
  private cache: LeaderboardUpdate[] = [];
  constructor(protected readonly mongoSource: LeaderboardUpdateMongoSource) {}

  public async add(updates: LeaderboardUpdate[]): Promise<Result> {
    try {
      const documents = updates.map(update => update.toDocument());
      if (documents.length > 0) {
        await this.mongoSource.insertMany(documents);
      }
      return Result.withoutContent();
    } catch (error) {
      this.cache.push(...updates);
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async next(): Promise<Result<LeaderboardUpdate>> {
    try {
      if (this.cache.length > 0) {
        return Result.withContent(this.cache.shift());
      }
      const document = await this.mongoSource.nextUpdate();
      if (document) {
        return Result.withContent(LeaderboardUpdate.fromDocument(document));
      }
      return Result.withFailure(Failure.fromError(new LeaderboardUpdateNotFoundError()));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async count(): Promise<Result<number>> {
    try {
      const count = await this.mongoSource.count({});
      const cacheSize = this.cache.length;
      log(`Updates stored in DB: ${count}, cache: ${cacheSize}`);
      return Result.withContent(count + cacheSize);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
