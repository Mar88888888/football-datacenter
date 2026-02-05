import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavTeam } from './user.favteam.entity';
import { UserFavComp } from './user.favcomp.entity';
import { CompetitionService } from '../../competitions/competition.service';
import { UsersService } from '../users.service';
import { TeamService } from '../../team/teams.service';
import { DataStatus } from '../../common/constants';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(UserFavComp)
    private readonly favCompRepo: Repository<UserFavComp>,
    @InjectRepository(UserFavTeam)
    private readonly favTeamRepo: Repository<UserFavTeam>,
    private readonly userService: UsersService,
    private readonly teamService: TeamService,
    private readonly compService: CompetitionService,
  ) {}

  private async getAvailableCompetitionIds(): Promise<Set<number>> {
    const result = await this.compService.findAll();
    if (result.status === DataStatus.PROCESSING || !result.data) {
      throw new ServiceUnavailableException('Competition data is loading. Please try again shortly.');
    }
    return new Set(result.data.map((c) => c.id));
  }

  async getFavTeams(userId: number) {
    const userFavTeams = await this.favTeamRepo.find({
      where: { user: { id: userId } },
    });

    // Return stored data directly - no API calls needed
    return userFavTeams.map((fav) => ({
      id: fav.teamId,
      name: fav.name,
      crest: fav.crest,
    }));
  }

  async getFavComps(userId: number) {
    const [userFavComps, availableIds] = await Promise.all([
      this.favCompRepo.find({
        where: { user: { id: userId } },
      }),
      this.getAvailableCompetitionIds(),
    ]);

    // Return stored data directly, filtered by available competitions
    return userFavComps
      .filter((fav) => availableIds.has(fav.competitionId))
      .map((fav) => ({
        id: fav.competitionId,
        name: fav.name,
        emblem: fav.emblem,
      }));
  }

  async addFavTeam(userId: number, teamId: number) {
    // Fetch team data first to store name and crest
    const result = await this.teamService.getById(teamId);
    if (result.status === DataStatus.PROCESSING || !result.data) {
      throw new ServiceUnavailableException('Team data is loading. Please try again shortly.');
    }
    const team = result.data;

    try {
      await this.favTeamRepo.insert({
        user: { id: userId },
        teamId,
        name: team.name,
        crest: team.crest,
      });
    } catch (error) {
      // Handle duplicate key error (race condition or already exists)
      if ((error as any)?.code === '23505') {
        throw new Error('Team is already a favorite');
      }
      throw error;
    }
  }

  async addFavComp(userId: number, compId: number) {
    const availableIds = await this.getAvailableCompetitionIds();

    if (!availableIds.has(compId)) {
      throw new Error('Competition is not available');
    }

    // Fetch competition data to store name and emblem
    const result = await this.compService.findById(compId);
    if (result.status === DataStatus.PROCESSING || !result.data) {
      throw new ServiceUnavailableException('Competition data is loading. Please try again shortly.');
    }
    const competition = result.data;

    try {
      await this.favCompRepo.insert({
        user: { id: userId },
        competitionId: compId,
        name: competition.name,
        emblem: competition.emblem,
      });
    } catch (error) {
      // Handle duplicate key error (race condition or already exists)
      if ((error as any)?.code === '23505') {
        throw new Error('Competition is already a favorite');
      }
      throw error;
    }
  }

  async removeFavTeam(userId: number, teamId: number) {
    await this.removeFavorite(
      userId,
      teamId,
      'favTeams',
      'teamId',
      this.favTeamRepo,
      'teams',
    );
  }

  async removeFavComp(userId: number, compId: number) {
    await this.removeFavorite(
      userId,
      compId,
      'favCompetitions',
      'competitionId',
      this.favCompRepo,
      'competitions',
    );
  }

  private async removeFavorite<T extends { id: number }>(
    userId: number,
    entityId: number,
    relationKey: 'favTeams' | 'favCompetitions',
    idField: 'teamId' | 'competitionId',
    repo: Repository<T>,
    entityName: string,
  ) {
    const user = await this.userService.findOne(userId);

    if (!user || !user[relationKey]) {
      throw new Error(`User or favorite ${entityName} not found.`);
    }

    const link = user[relationKey].find((fav) => fav[idField] === entityId);

    if (!link) {
      return;
    }

    await repo.delete({ id: link.id } as any);
  }
}
