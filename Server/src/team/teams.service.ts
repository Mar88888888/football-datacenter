import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Team } from './team';
import axios from 'axios';
import { Competition } from '../competition/competition';

@Injectable()
export class TeamService {

  private readonly logger = new Logger(TeamService.name);


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
      if(name.length < 2 || name.trim().length < 2){
        return [];
      }

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
