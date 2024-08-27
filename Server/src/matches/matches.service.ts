import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class MatchesService {
  constructor(private readonly httpService: HttpService,
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
      let limitSet = parseInt(limit);
      if(!isNaN(limitSet)){
        let matches = response.data.events?.slice(0, limitSet);
        return matches
      }
      return response.data.events?.slice(0, 10);
    }catch(e){
      console.log(e.message);
      return [];
    }
  }
}
