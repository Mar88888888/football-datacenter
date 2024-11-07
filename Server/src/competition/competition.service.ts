import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Competition } from './competition';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);
  
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async findById(compId: number){
    try {
      let competitionUrl = `https://www.sofascore.com/api/v1/unique-tournament/${compId}`;
      const teamResponse = await lastValueFrom(this.httpService.get(competitionUrl));
      const fetchedComp = teamResponse.data.uniqueTournament;
      
      if (!fetchedComp || fetchedComp.category.sport.id !== 1) {
        throw new NotFoundException(`Competition with id ${compId} not found`);
      }

      let competition = new Competition();
      competition.setId(compId);
      competition.setName(fetchedComp.name);
      competition.setEmblem(`https://www.sofascore.com/api/v1/unique-tournament/${compId}/image`);

      return competition;

    } catch (error) {
      if (error.response && error.response.status === 404 || error instanceof NotFoundException) {
        throw new NotFoundException(`Competition with id ${compId} not found`);
      }
      throw new Error('Failed to fetch competition data');
    }  

  }

  async getTopLeagues(region? :string){
    const response = await axios.get(`https://www.sofascore.com/api/v1/config/top-unique-tournaments/${region ? region : 'EN'}/football`);

    const competitions: Competition[] = response.data.uniqueTournaments
        .map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          emblem: `https://www.sofascore.com/api/v1/unique-tournament/${comp.id}/image`
        }));

    return competitions;
  }

  async searchByName(name: string): Promise<Competition[]> {
    try {
      if(name.length < 2 || name.trim().length < 2){
        return [];
      }
      const response = await axios.get(`https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(name)}`);
      
      const competitions: Competition[] = response.data.results
        .filter((result: any) => result.type === 'uniqueTournament')
        .map((result: any) => ({
          id: result.entity.id,
          name: result.entity.name,
          emblem: `https://www.sofascore.com/api/v1/unique-tournament/${result.entity.id}/image`
        }));

      return competitions;
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return [];
    }
  }
}