import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavTeam } from './user.favteam.entity';
import { UserFavComp } from './user.favcomp.entity';
import { CompetitionService } from '../../competitions/competition.service';
import { UsersService } from '../users.service';
import { TeamService } from '../../team/teams.service';

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
    const competitions = await this.compService.findAll();
    return new Set(competitions.map((c) => c.id));
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
    const existingFav = await this.favTeamRepo.findOne({
      where: { user: { id: userId }, teamId },
    });

    if (existingFav) {
      throw new Error('Team is already a favorite');
    }

    // Fetch team data to store name and crest
    const team = await this.teamService.getById(teamId);

    await this.favTeamRepo.insert({
      user: { id: userId },
      teamId,
      name: team.name,
      crest: team.crest,
    });
  }

  async addFavComp(userId: number, compId: number) {
    const [existingFav, availableIds] = await Promise.all([
      this.favCompRepo.findOne({
        where: { user: { id: userId }, competitionId: compId },
      }),
      this.getAvailableCompetitionIds(),
    ]);

    if (!availableIds.has(compId)) {
      throw new Error('Competition is not available');
    }

    if (existingFav) {
      throw new Error('Competition is already a favorite');
    }

    // Fetch competition data to store name and emblem
    const competition = await this.compService.findById(compId);

    await this.favCompRepo.insert({
      user: { id: userId },
      competitionId: compId,
      name: competition.name,
      emblem: competition.emblem,
    });
  }

  async removeFavTeam(userId: number, teamId: number) {
    const userWithFavTeams = await this.userService.findOne(userId);

    if (!userWithFavTeams || !userWithFavTeams.favTeams) {
      throw new Error('User or favorite teams not found.');
    }

    const teamLink = userWithFavTeams.favTeams.find(
      (fav) => fav.teamId === teamId,
    );

    if (!teamLink) {
      return;
    }

    await this.favTeamRepo.delete({ id: teamLink.id });
  }

  async removeFavComp(userId: number, compId: number) {
    const userWithFavComps = await this.userService.findOne(userId);

    if (!userWithFavComps || !userWithFavComps.favTeams) {
      throw new Error('User or favorite comps not found.');
    }

    const compLink = userWithFavComps.favCompetitions.find(
      (fav) => fav.competitionId === compId,
    );

    if (!compLink) {
      return;
    }

    await this.favCompRepo.delete({ id: compLink.id });
  }
}
