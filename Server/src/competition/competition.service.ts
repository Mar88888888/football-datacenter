import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,

  ) {}

  async fetchAndStoreCompetitions(): Promise<void> {
    try {
      const categoryIds = Array.from({ length: 1000 }, (_, i) => i + 1);
      const urlTemplate = 'https://www.sofascore.com/api/v1/category/{category_id}/unique-tournaments';
      const footballCompetitions = [];

      for (const categoryId of categoryIds) {
        const url = urlTemplate.replace('{category_id}', categoryId.toString());
        console.log(`GET: ${url}`);

        try {
          const response = await lastValueFrom(this.httpService.get(url));
          const groups = response.data.groups || [];
          for (const group of groups) {
            for (const tournament of group.uniqueTournaments || []) {
              if (tournament.category.sport.name === 'Football') {
                footballCompetitions.push(tournament);
              }
            }
          }
        } catch (error) {
          if (error.response?.status === 404) {
            this.logger.warn(`Category ID ${categoryId} returned 404, skipping...`);
            continue;
          } else {
            this.logger.error(`Error fetching data for category ID ${categoryId}: ${error.message}`);
          }
        }
      }

      // Save competitions to database
      for (const competition of footballCompetitions) {
        competition.emblem = `https://www.sofascore.com/api/v1/unique-tournament/${competition.id}/image`
        await this.competitionRepository.save(competition);
        console.log(`Saved ${footballCompetitions.length} football competitions.`);
      }


    } catch (err) {
      this.logger.error(`Error in fetchAndStoreCompetitions: ${err.message}`);
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