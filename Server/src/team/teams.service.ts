import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Team } from './team';
import axios from 'axios';
import { Competition } from '../competition/competition';

@Injectable()
export class TeamService {

  private readonly logger = new Logger(TeamService.name);

  // async fetchAndStoreTeams(): Promise<void> {
  //   try {
  //     const competitions = await this.competitionRepository.find();

  //     for (const competition of competitions) {
  //       const tournamentId = competition.id;

  //       const seasonUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`;
  //       let currentSeasonId: number;

  //       try {
  //         const seasonResponse = await lastValueFrom(this.httpService.get(seasonUrl));
  //         const seasonsData = seasonResponse.data;

  //         if (seasonsData.seasons && seasonsData.seasons.length > 0) {
  //           currentSeasonId = seasonsData.seasons[0].id;
  //         } else {
  //           this.logger.warn(`No seasons available for tournament ID: ${tournamentId}`);
  //           continue; 
  //         }
  //       } catch (error) {
  //         if (error.response?.status === 404) {
  //           this.logger.warn(`Seasons not found for tournament ID: ${tournamentId}`);
  //           continue; 
  //         } else {
  //           this.logger.error(`Error fetching seasons for tournament ID ${tournamentId}: ${error.message}`);
  //           continue;
  //         }
  //       }

  //       const teamsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${currentSeasonId}/teams`;
  //       try {
  //         const teamsResponse = await lastValueFrom(this.httpService.get(teamsUrl));
  //         const teamsData = teamsResponse.data.teams || [];
          
  //         for (const teamData of teamsData) {
  //           let team = await this.teamRepository.findOne({
  //             where: { id: teamData.id },
  //             relations: ['competitions'],
  //           });
            
  //           if (!team) {
  //             team = new Team();
  //             team.id = teamData.id;
  //           }
  //           const teamUrl = `https://www.sofascore.com/api/v1/team/${team.id}`;
  //           const teamResponse = await lastValueFrom(this.httpService.get(teamUrl));
  //           const teamFetchedData = teamResponse.data.team || team;

  //           team.name = teamFetchedData.name;
  //           team.shortName = teamFetchedData.shortName;
  //           team.crest = `https://api.sofascore.app/api/v1/team/${team.id}/image`;
  //           team.address = teamFetchedData?.venue?.city.name;
  //           let date = new Date(teamFetchedData.foundationDateTimestamp * 1000);
  //           team.founded = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  //           team.clubColors = teamFetchedData.teamColors.primary;

  //           const coachName = teamFetchedData.manager?.name;
  //           team.coachName = coachName;

  //           if (!team.competitions) {
  //             team.competitions = [];
  //           }
  //           if (!team.competitions.some(c => c.id === competition.id)) {
  //             team.competitions.push(competition);
  //           }

  //           console.log(`Fetched team with id ${team.id}`)
  //           await this.teamRepository.save(team);
  //         }
  //       } catch (error) {
  //         this.logger.error(`Error fetching teams for tournament ID ${tournamentId}: ${error.message}`);
  //       }
  //     }
  //   } catch (err) {
  //     this.logger.error(err.message);
  //   }
  // }

  async findById(teamId: number) {
    const teamUrl = `https://www.sofascore.com/api/v1/team/${teamId}`;
    try {
      const teamResponse = await axios.get(teamUrl);
      const teamFetchedData = teamResponse.data.team;
      
      if (!teamFetchedData) {
        throw new NotFoundException(`Team with id ${teamId} not found`);
      }

      let team = new Team();
      team.setId(teamId);
      team.setName(teamFetchedData.name);
      team.setShortName(teamFetchedData.shortName);
      team.setCrest(`https://api.sofascore.app/api/v1/team/${teamId}/image`);
      team.setAddress(teamFetchedData?.venue?.city.name);
      team.setGender(teamFetchedData.gender);

      let date = new Date(teamFetchedData.foundationDateTimestamp * 1000);
      team.setFounded(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
      team.setClubColors(teamFetchedData.teamColors.primary);
      team.setCoachName(teamFetchedData.manager?.name);

      let compsUrl = `https://www.sofascore.com/api/v1/team/${teamId}/team-statistics/seasons/`
      let teamCompetitions = await axios.get(compsUrl);
      let competitions = teamCompetitions.data.uniqueTournamentSeasons
        .filter(comp => {
          let year = new Date()
            .getFullYear()
            .toString()
            .split('')
            .splice(2)
            .join('');
          return comp.seasons[0].year.split('/').includes(year);
        })

      team.setCompetitions(competitions.map(comp => {
        let competition = new Competition();
        return competition
          .setId(comp.uniqueTournament.id)
          .setName(comp.uniqueTournament.name);
         
      }));
      return team;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Team with id ${teamId} not found`);
      }
      throw new Error('Failed to fetch team data');
    }  
  }
    
  async searchByName(name: string): Promise<Team[]> {
    try {
      const response = await axios.get(`https://www.sofascore.com/api/v1/search/all?q=${encodeURIComponent(name)}`);
      
      const teams: Team[] = response.data.results
        .filter(result => result.type === 'team' && result.entity.sport.id === 1)
        .map(result => ({
          id: result.entity.id,
          name: result.entity.name,
          crest: `https://www.sofascore.com/api/v1/team/${result.entity.id}/image`
        }));

      return teams;
    } catch (error) {
      console.error('Error searching team:', error);
      return [];
    }
  }
}
