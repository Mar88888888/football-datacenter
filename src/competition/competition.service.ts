import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import { GlobalRequestCounterService } from '../global-request-counter.service';
import { lastValueFrom } from 'rxjs';


@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    private readonly globalRequestCounterService: GlobalRequestCounterService,

  ) {}

  async fetchAndStoreCompetitions(): Promise<void> {
    try{

      // Get available comps from API
      let apiurl = 'https://api.football-data.org/v4/competitions';
      console.log(`GET: ${apiurl}`);
      const response = await this.httpService.get(apiurl, {
        headers: { 'X-Auth-Token': process.env.API_KEY },
      }).toPromise();
  
      await this.globalRequestCounterService.incrementCounter();
  
      const competitions = response.data.competitions;
      for (const competition of competitions) {
        if(competition.plan === 'TIER_ONE'){
          //Save into db
          await this.competitionRepository.save(competition);
        }
      }
    }
    catch (err){
      this.logger.error(`Err in CompService ${err.message}`);
    }
  }

  async getAllCompetitions(): Promise<Competition[]> {
    return this.competitionRepository.find();
  }

  async findById(id: number){
    return await this.competitionRepository.findOne({where: {id}});
  }

  async findTeams(id: number){

    // Get competition by id with its teams
    let competition = await this.competitionRepository.findOne({where: {id}, relations: ['team']});
    if(!competition){
      throw new NotFoundException(`Competition with id ${id} not found`)
    }
    return competition.team;
  }

  async getMatches(competitionId: number, fromDate?: Date, toDate?: Date): Promise<any[]> {
    let url = `https://api.football-data.org/v4/competitions/${competitionId}/matches${fromDate && toDate 
    ? '?dateFrom=' + fromDate.toISOString().split('T')[0] +
      '&dateTo=' + toDate.toISOString().split('T')[0]: ''}`;
    console.log(url);
    try{
      // Parse matches in set period
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'X-Auth-Token': process.env.API_KEY },
        }),
      );
      await this.globalRequestCounterService.incrementCounter();
      return response.data.matches;
    }catch(e){
      console.log(e.message);
      return [];
    }
  }

  async searchByName(name: string): Promise<Competition[]> {
    return await this.competitionRepository
      .createQueryBuilder('competition')
      .where('competition.name ILIKE :name', { name: `%${name}%` })
      .getMany();
  }
}
