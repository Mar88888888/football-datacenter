import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { Competition } from '../competition/competition.entity';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class TeamService {

  private readonly logger = new Logger(TeamService.name);
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
  ) {}

  async fetchAndStoreTeams(): Promise<void> {
    try {
      const competitions = await this.competitionRepository.find();

      for (const competition of competitions) {
        const tournamentId = competition.id;

        // Get the current season ID for the tournament
        const seasonUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`;
        let currentSeasonId: number;

        try {
          const seasonResponse = await lastValueFrom(this.httpService.get(seasonUrl));
          const seasonsData = seasonResponse.data;

          if (seasonsData.seasons && seasonsData.seasons.length > 0) {
            currentSeasonId = seasonsData.seasons[0].id;
          } else {
            this.logger.warn(`No seasons available for tournament ID: ${tournamentId}`);
            continue; // Skip to the next tournament
          }
        } catch (error) {
          if (error.response?.status === 404) {
            this.logger.warn(`Seasons not found for tournament ID: ${tournamentId}`);
            continue; // Skip to the next tournament
          } else {
            this.logger.error(`Error fetching seasons for tournament ID ${tournamentId}: ${error.message}`);
            continue;
          }
        }

        // Fetch teams for the current season
        const teamsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${currentSeasonId}/teams`;
        try {
          const teamsResponse = await lastValueFrom(this.httpService.get(teamsUrl));
          const teamsData = teamsResponse.data.teams || [];
          
          for (const teamData of teamsData) {
            let team = await this.teamRepository.findOne({
              where: { id: teamData.id },
              relations: ['competitions'],
            });
            
            if (!team) {
              team = new Team();
              team.id = teamData.id;
            }
            const teamUrl = `https://www.sofascore.com/api/v1/team/${team.id}`;
            const teamResponse = await lastValueFrom(this.httpService.get(teamUrl));
            const teamFetchedData = teamResponse.data.team || team;

            team.name = teamFetchedData.name;
            team.shortName = teamFetchedData.shortName;
            team.crest = `https://api.sofascore.app/api/v1/team/${team.id}/image`;
            team.address = teamFetchedData?.venue?.city.name;
            let date = new Date(teamFetchedData.foundationDateTimestamp * 1000);
            team.founded = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            team.clubColors = teamFetchedData.teamColors.primary;

            const coachName = teamFetchedData.manager?.name;
            team.coachName = coachName;

            // Associate the team with the competition
            if (!team.competitions) {
              team.competitions = [];
            }
            if (!team.competitions.some(c => c.id === competition.id)) {
              team.competitions.push(competition);
            }

            // Save the team
            console.log(`Fetched team with id ${team.id}`)
            await this.teamRepository.save(team);
          }
        } catch (error) {
          this.logger.error(`Error fetching teams for tournament ID ${tournamentId}: ${error.message}`);
        }
      }
    } catch (err) {
      this.logger.error(err.message);
    }
  }
  
  async getAllTeams(): Promise<Team[]> {
    let team = await this.teamRepository.find({ relations: ['competitions'] });
    if(!team || team.length == 0){
      throw new NotFoundException('Team not found')
    }
    return team;
  }

  async findOne(teamId: number) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['competitions'],  
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    return team;
  }

  async searchByName(name: string): Promise<Team[]> {
    try {
      const response = await axios.get(`https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(name)}`);
      
      const teams: Team[] = response.data.results
        .filter((result: any) => result.type === 'team')
        .map((result: any) => ({
          id: result.entity.id,
          name: result.entity.name,
          crest: `https://www.sofascore.com/api/v1/team/${result.entity.id}/image`
        }));

      return teams;
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return [];
    }
  }
}
