import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CompetitionService } from '../competition/competition.service';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Injectable()
export class TeamService {

  private readonly logger = new Logger(TeamService.name);
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly competitionService: CompetitionService,
    private readonly globalRequestCounterService: GlobalRequestCounterService
  ) {}

  async fetchAndStoreTeams(): Promise<void> {
    const competitions = await this.competitionService.getAllCompetitions();
    for (const comp of competitions) {
      let url = `https://api.football-data.org/v4/competitions/${comp.id}/teams`;
      this.logger.log(`Storing teams from: ${url}`);
      const response = await this.httpService.get(url, {
        headers: { 'X-Auth-Token': process.env.API_KEY },
      }).toPromise();

      await this.globalRequestCounterService.incrementCounter();

      const teams = response.data.teams;
      for (const team of teams) {
        await this.teamRepository.save(team);
      }
    }
  }

  async getAllTeams(): Promise<Team[]> {
    console.log('Err is coming');
    return this.teamRepository.find({ relations: ['coach', 'squad'] });
  }

  async fetchAvailableTeamsId(): Promise<number[]> {
    const competitions = await this.competitionService.getAllCompetitions();
    let ids = [];
    for (const comp of competitions) {
      let url = `https://api.football-data.org/v4/competitions/${comp.id}/teams`;
      this.logger.log(`Fetching id's from: ${url}`);

      const response = await this.httpService.get(url, {
        headers: { 'X-Auth-Token': process.env.API_KEY },
      }).toPromise();

      await this.globalRequestCounterService.incrementCounter();

      const teams = response.data.teams;
      for (const team of teams) {
        ids.push(team.id);
      }
    }
    return ids;
  }
}
