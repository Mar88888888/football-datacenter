import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getTeamPlayers(teamId: number){
    const url = `https://api.sofascore.com/api/v1/team/${teamId}/players`;
    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data.players;
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
    const url = `https://api.sofascore.com/api/v1/player/${id}`;
    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data.player;
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
