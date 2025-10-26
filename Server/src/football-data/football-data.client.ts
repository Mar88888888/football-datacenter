import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Competition } from '../competition/competition';
import { MatchesResponse } from '../matches/dto/matches.response.interface';
import { Match } from '../matches/dto/match';
import { Team } from '../team/team';
import { Table } from 'typeorm';
import { Standings } from '../standings/standings';

@Injectable()
export class FootballDataClient {
  private readonly logger = new Logger(FootballDataClient.name);

  constructor(private readonly httpService: HttpService) {}

  private async fetchData<T>(path: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get(path).pipe(
        catchError((error: AxiosError) => {
          if (error.response?.status === 404) {
            this.logger.warn(`Resource not found at path: ${path}`);
            throw new NotFoundException(`Resource not found at path: ${path}`);
          }

          this.logger.error(
            `Error fetching data from the path: ${path}`,
            error.stack,
            error.response?.data,
          );
          throw error;
        }),
      ),
    );

    return data;
  }

  private formatDateToLocalYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getCompetitionById(competitionId: number): Promise<Competition> {
    const competition = await this.fetchData<Competition>(
      `/competitions/${competitionId}`,
    );

    return competition;
  }

  async getCompetitionMatches(competitionId: number): Promise<Match[]> {
    const response = await this.fetchData<MatchesResponse>(
      `/competitions/${competitionId}/matches`,
    );

    return response.matches;
  }

  async getMatches(date?: Date): Promise<Match[]> {
    let url = `/matches`;

    if (date) {
      const formattedDate = this.formatDateToLocalYYYYMMDD(date);

      let nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      const formattedNextDate = this.formatDateToLocalYYYYMMDD(nextDay);

      const params = new URLSearchParams({
        dateFrom: formattedDate,
        dateTo: formattedNextDate,
      });
      url += `?${params.toString()}`;
    }

    const response = await this.fetchData<MatchesResponse>(url);

    return response.matches;
  }

  async getTeamById(teamId: number): Promise<Team> {
    const team = await this.fetchData<Team>(`/teams/${teamId}`);

    return team;
  }

  async getCompetitionStandings(competitionId: number): Promise<Standings> {
    const standings = await this.fetchData<Standings>(
      `/competitions/${competitionId}/standings`,
    );

    return standings;
  }
}
