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

  async getFavTeams(userId: number) {
    const userFavTeams = await this.favTeamRepo.find({
      where: { user: { id: userId } },
    });

    const teamIds = userFavTeams.map((team) => team.teamId);

    const favTeams = await Promise.all(
      teamIds.map((teamId) => this.teamService.getById(teamId)),
    );

    return favTeams;
  }

  async getFavComps(userId: number) {
    const userFavComps = await this.favCompRepo.find({
      where: { user: { id: userId } },
    });

    const compIds = userFavComps.map((comp) => comp.competitionId);

    const favCompetitions = await Promise.all(
      compIds.map((compId) => this.compService.findById(compId)),
    );

    return favCompetitions;
  }

  async addFavTeam(userId: number, teamId: number) {
    const existingFav = await this.favTeamRepo.findOne({
      where: { user: { id: userId }, teamId },
    });

    if (existingFav) {
      throw new Error('Team is already a favorite');
    }

    await this.teamService.getById(teamId);

    await this.favTeamRepo.insert({
      user: { id: userId },
      teamId,
    });
  }

  async addFavComp(userId: number, compId: number) {
    const existingFav = await this.favCompRepo.findOne({
      where: { user: { id: userId }, competitionId: compId },
    });

    if (existingFav) {
      throw new Error('Competition is already a favorite');
    }

    await this.compService.findById(compId);

    await this.favCompRepo.insert({
      user: { id: userId },
      competitionId: compId,
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
