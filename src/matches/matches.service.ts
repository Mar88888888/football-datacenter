import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';


@Injectable()
export class MatchesService {
  private readonly apiUrl = 'https://api.football-data.org/v4';
  private readonly apiKey = process.env.API_KEY; 
  constructor(private readonly httpService: HttpService) {}

  async getMatches(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/matches`, {
          headers: { 'X-Auth-Token': this.apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }
}
