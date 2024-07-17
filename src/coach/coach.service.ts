import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
import { TeamService } from '../team/teams.service';

@Injectable()
export class CoachService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly teamService: TeamService,
  ) {}

  async fetchAndStoreCoaches(): Promise<void> {
    const teams = await this.teamService.getAllTeams();
    for (const team of teams) {
      if (team.coach && team.coach.id) {
        await this.coachRepository.save(team.coach);
      }
    }
  }
}
