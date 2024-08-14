import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GlobalRequestCounterService } from '../global-request-counter.service';
import { stat } from 'fs';


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
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async getLiveMatches(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/matches?status=LIVE`, {
          headers: { 'X-Auth-Token': this.apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async getTeamMatches(teamId: number, fromDate?: Date, toDate?: Date, status?: string, limit?: string): Promise<any[]> {
    // Parsing matches of the team
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
}
