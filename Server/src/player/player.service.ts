import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger

  constructor(
    private readonly httpService: HttpService,
    private readonly globalRequestCounterService: GlobalRequestCounterService,

  ) {}

  async getTeamPlayers(teamId: number){
    const url = `https://api.football-data.org/v4/teams/${teamId}`;
    try {
      const response = await this.httpService.get(url, {
        headers: { 'X-Auth-Token': process.env.API_KEY },
      }).toPromise();
      await this.globalRequestCounterService.incrementCounter();
      return response.data.squad;
    } catch (error) {
      if (error.isAxiosError && error.response?.status === 404) {
        throw new NotFoundException(`Team with id ${teamId} not found`);
      } else {
        this.logger.error(`Failed to fetch data for id ${teamId}`, error.stack);
        throw error;
      }
    }
 }

  async getPlayerById(id: number){
    const url = `https://api.football-data.org/v4/persons/${id}`;
    try {
      const response = await this.httpService.get(url, {
        headers: { 'X-Auth-Token': process.env.API_KEY },
      }).toPromise();
      await this.globalRequestCounterService.incrementCounter();
      return response.data;
    } catch (error) {
      if (error.isAxiosError && error.response?.status === 404) {
        throw new NotFoundException(`PLayer with id ${id} not found`);
      } else {
        this.logger.error(`Failed to fetch data for id ${id}`, error.stack);
        throw error;
      }
    }
  }
}
