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

  // async fetchAndStoreCompetitions(): Promise<void> {
  //   try {
  //     const categoryIds = Array.from({ length: 1000 }, (_, i) => i + 1);
  //     const urlTemplate = 'https://www.sofascore.com/api/v1/category/{category_id}/unique-tournaments';
  //     const footballCompetitions = [];

  //     for (const categoryId of categoryIds) {
  //       const url = urlTemplate.replace('{category_id}', categoryId.toString());
  //       console.log(`GET: ${url}`);

  //       try {
  //         const response = await lastValueFrom(this.httpService.get(url));
  //         const groups = response.data.groups || [];
  //         for (const group of groups) {
  //           for (const tournament of group.uniqueTournaments || []) {
  //             if (tournament.category.sport.name === 'Football') {
  //               footballCompetitions.push(tournament);
  //             }
  //           }
  //         }
  //       } catch (error) {
  //         if (error.response?.status === 404) {
  //           this.logger.warn(`Category ID ${categoryId} returned 404, skipping...`);
  //           continue;
  //         } else {
  //           this.logger.error(`Error fetching data for category ID ${categoryId}: ${error.message}`);
  //         }
  //       }
  //     }

  //     for (const competition of footballCompetitions) {
  //       competition.emblem = `https://www.sofascore.com/api/v1/unique-tournament/${competition.id}/image`
  //       await this.competitionRepository.save(competition);
  //       console.log(`Saved ${footballCompetitions.length} football competitions.`);
  //     }


  //   } catch (err) {
  //     this.logger.error(`Error in fetchAndStoreCompetitions: ${err.message}`);
  //   }
  // }

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


  async searchByName(name: string): Promise<Competition[]> {
    try {
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