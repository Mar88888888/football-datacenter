import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import { GlobalRequestCounterService } from '../global-request-counter.service';


@Injectable()
export class CompetitionService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    private readonly globalRequestCounterService: GlobalRequestCounterService,

  ) {}

  async fetchAndStoreCompetitions(): Promise<void> {
    let apiurl = 'https://api.football-data.org/v4/competitions';
    console.log(`GET: ${apiurl}`);
    const response = await this.httpService.get(apiurl, {
      headers: { 'X-Auth-Token': process.env.API_KEY },
    }).toPromise();

    await this.globalRequestCounterService.incrementCounter();

    const competitions = response.data.competitions;
    for (const competition of competitions) {
      if(competition.plan === 'TIER_ONE'){
        await this.competitionRepository.save(competition);
      }
    }
  }

  async getAllCompetitions(): Promise<Competition[]> {
    return this.competitionRepository.find();
  }
}
