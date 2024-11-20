import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { isSameDate } from '../date.utils';
import { FavouriteService } from '../users/favourite/favourite.service';
import { IFavouriteService } from '../users/favourite/favourite.service.interface';
import { IMatchesService } from './matches.service.interface';

@Injectable()
export class MatchesService implements IMatchesService{
  constructor(private readonly httpService: HttpService,
    @Inject('IFavouriteService') private readonly favService: IFavouriteService,
  ) {}

 async getMatches(date?: Date): Promise<any> {
    let matches = [];
    if(!date){
      date = new Date();
    }
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const url = `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${formattedDate}`;
      
      const response = await axios.get(url);
      matches = response.data.events;
      matches = matches.filter(match=> new Date(match.startTimestamp * 1000).getDate() == date.getDate());
      return matches;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

async getUserMatches(userId: number) {
  let favTeams = await this.favService.getFavTeams(userId);

  let favMatches = await Promise.all(favTeams.map(async (team) => {
    let nextMatches = await this.getTeamMatches(team.getId()).then(res => res.next);
    if (nextMatches.length > 0) {
      let matchDate = new Date(nextMatches[0].startTimestamp * 1000);
      let today = new Date();

      if (isSameDate(matchDate, today)) {
        return nextMatches[0];
      }
    }
    return null;
  }));

  favMatches = favMatches.filter(match => match !== null);

  let allMatches = await this.getMatches();
  let favTeamIds = favTeams.map(team => team.getId());
  
  let notFavMatches = allMatches.filter(match => 
    !favTeamIds.includes(match.homeTeam.id) && !favTeamIds.includes(match.awayTeam.id)
  );

  return {favMatches, notFavMatches};
}


  async getLiveMatches(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`https://www.sofascore.com/api/v1/sport/football/events/live`, {
        }),
      );

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getTeamMatches(teamId: number): Promise<{last: any[], next: any[]}> {
    let url = `https://www.sofascore.com/api/v1/team/${teamId}/events`;
    try{
      const response = await lastValueFrom(
        this.httpService.get(`${url}/last/0`),
      );
      const responseNext = await lastValueFrom(
        this.httpService.get(`${url}/next/0`),
      );
      return { last: response.data.events, next: responseNext.data.events };
    }catch(e){
      console.log(e.message);
      return {last: [], next: []};
    }

  }
  
  async getCompMatches(compId: number, limit?: string, prev?: boolean): Promise<any[]> {
    
    const tournamentUrl = `https://www.sofascore.com/api/v1/unique-tournament/${compId}/seasons`;
    const tournamentResponse = await axios.get(tournamentUrl);
    const currentSeasonId = tournamentResponse.data.seasons[0].id;
    let url = `https://www.sofascore.com/api/v1/unique-tournament/${compId}/season/${currentSeasonId}/events/${prev? 'last': 'next'}/0`;
    try{
      const response = await lastValueFrom(
        this.httpService.get(url),
      );
      let matches = response.data.events;
      let limitSet = parseInt(limit);
      if(isNaN(limitSet)){
        limitSet = 10;
      }
      return matches?.slice(prev ? matches.length - limitSet : 0, prev ? matches.length : limitSet);
       
    }catch(e){
      console.log(e.message);
      return [];
    }
  }
}
