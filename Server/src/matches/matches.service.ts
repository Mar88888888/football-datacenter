import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GlobalRequestCounterService } from '../global-request-counter.service';
import { stat } from 'fs';
import { constrainedMemory } from 'process';


@Injectable()
export class MatchesService {
  private readonly apiUrl = 'https://api.football-data.org/v4';
  private readonly apiKey = process.env.API_KEY; 
  constructor(private readonly httpService: HttpService,
        private readonly globalRequestCounterService: GlobalRequestCounterService
  ) {}

  async getMatches(fromDate?: Date, toDate?: Date): Promise<any> {
    let url = `https://api.football-data.org/v4/matches${fromDate && toDate 
        ? '?dateFrom=' + fromDate.toISOString().split('T')[0] +
         '&dateTo=' + toDate.toISOString().split('T')[0]: ''}`;
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'X-Auth-Token': this.apiKey },
        }),
      );
      await this.globalRequestCounterService.incrementCounter();

      return response.data.matches;
    } catch (error) {
      console.log(error);
    }
  }

  async getLiveMatches(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/matches?status=LIVE`, {
          headers: { 'X-Auth-Token': this.apiKey },
        }),
      );
      await this.globalRequestCounterService.incrementCounter();

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getTeamMatches(teamId: number, fromDate?: Date, toDate?: Date, status?: string, limit?: string): Promise<any[]> {
    let url = `https://api.football-data.org/v4/teams/${teamId}/matches${fromDate && toDate || status || limit ? '?' : ''}${fromDate && toDate 
        ? 'dateFrom=' + fromDate.toISOString().split('T')[0] +
         '&dateTo=' + toDate.toISOString().split('T')[0] : ''}${status ? '&status='+status : ''}${limit ? '&limit='+parseInt(limit) : ''}`;
    try{
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
  
  async getCompMatches(compId: number, fromDate?: Date, toDate?: Date, status?: string, limit?: string): Promise<any[]> {
    let url = `https://api.football-data.org/v4/competitions/${compId}/matches${fromDate && toDate || status ? '?' : ''}${fromDate && toDate 
        ? 'dateFrom=' + fromDate.toISOString().split('T')[0] +
         '&dateTo=' + toDate.toISOString().split('T')[0] : ''}${status ? '&status='+status : ''}`;
    try{
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { 'X-Auth-Token': process.env.API_KEY },
        }),
      );
      await this.globalRequestCounterService.incrementCounter();
      let limitSet = parseInt(limit);
      if(!isNaN(limitSet)){
        let matches = response.data.matches.slice(0, limitSet);
        return matches
      }
      return response.data.matches?.slice(0, 10);
    }catch(e){
      console.log(e.message);
      return [];
    }
  }
}
