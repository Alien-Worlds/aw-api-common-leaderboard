import { Mapper } from '@alien-worlds/api-core';
import { Leaderboard } from '../../domain/entities/leaderboard';
import { LeaderboardDocument } from '../leaderboard.dtos';

export class LeaderboardMapper implements Mapper<Leaderboard, LeaderboardDocument> {
  toEntity(document: LeaderboardDocument): Leaderboard {
    return Leaderboard.fromDocument(document);
  }
  toDataObject(entity: Leaderboard): LeaderboardDocument {
    return entity.toDocument();
  }
}
