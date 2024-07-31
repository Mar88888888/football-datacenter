import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Team } from '../team/team.entity';
import { Competition } from '../competition/competition.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string, name:string) {
    const user = this.repo.create({ email, password, name, favCompetitions: [], favTeams: [] });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  findAll() {
    return this.repo.find({ relations: ['favCompetitions', 'favTeams'] });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.repo.remove(user);
  }

  async saveVerificationToken(userId: number, token: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    user.verificationToken = token;
    await this.repo.save(user);
  }

  async findByVerificationToken(token: string): Promise<User> {
    let [user] = await this.repo.find({where: {verificationToken: token} });
    return user;
  }

  async addFavTeam(userId: number, team: Team) {
    const userWithFavTeams = await this.repo.findOne({
      where: { id: userId },
      relations: ['favTeams'],
    });

    if (!userWithFavTeams.favTeams) {
      userWithFavTeams.favTeams = [];
    }

    userWithFavTeams.favTeams.push(team);

    return await this.repo.save(userWithFavTeams);
  }

  async getFavTeams(userId: number) {
    const userWithFavTeams = await this.repo.findOne({
      where: { id: userId },
      relations: ['favTeams'],
    });

    if (!userWithFavTeams.favTeams) {
      userWithFavTeams.favTeams = [];
    }

    return userWithFavTeams.favTeams;
  }

  async getFavComps(userId: number) {
    const userWithFavComps = await this.repo.findOne({
      where: { id: userId },
      relations: ['favCompetitions'],
    });


    if (!userWithFavComps.favCompetitions) {
      userWithFavComps.favCompetitions = [];
    }

    return userWithFavComps.favCompetitions;
  }
  
  async addFavCompetition(userId: number, competition: Competition) {
    const userWithFavComps = await this.repo.findOne({
      where: { id: userId },
      relations: ['favCompetitions'],
    });

    if (!userWithFavComps.favCompetitions) {
      userWithFavComps.favCompetitions = [];
    }

    userWithFavComps.favCompetitions.push(competition);

    return await this.repo.save(userWithFavComps);
  }

  async removeFavCompetition(userId: number, competitionId: number) {
    const userWithFavComps = await this.repo.findOne({
      where: { id: userId },
      relations: ['favCompetitions'],
    });

    if (!userWithFavComps.favCompetitions) {
      userWithFavComps.favCompetitions = [];
    }

    userWithFavComps.favCompetitions = userWithFavComps.favCompetitions.filter(competition => {
      return competition.id != competitionId;
    });
    
    return await this.repo.save(userWithFavComps);
  }

  async removeFavTeam(userId: number, teamId: number) {
    const userWithFavTeams = await this.repo.findOne({
      where: { id: userId },
      relations: ['favTeams'],
    });

    if (!userWithFavTeams.favTeams) {
      userWithFavTeams.favTeams = [];
    }

    userWithFavTeams.favTeams = userWithFavTeams.favTeams.filter(team => {
      return team.id !== teamId;
    });

    return await this.repo.save(userWithFavTeams);
  }
}
