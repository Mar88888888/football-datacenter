import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FootballDataService } from '../football-data/football-data.service';
import { Match } from './match';

@Injectable()
export class MatchesService {
  constructor(private dataService: FootballDataService) {}

  private readonly logger = new Logger(MatchesService.name);

  private formatDateToLocalYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getMatches(date?: Date): Promise<Match[]> {
    let matches = [];

    try {
      let url = `matches`;

      if (date) {
        const formattedDate = this.formatDateToLocalYYYYMMDD(date);
        let nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        const formattedNextDate = this.formatDateToLocalYYYYMMDD(nextDay);
        url += '?dateFrom=' + formattedDate + '&dateTo=' + formattedNextDate;
      }

      const response = await this.dataService.get(url);
      matches = response.matches;

      return matches;
    } catch (error) {
      this.logger.error(
        `Failed to fetch matches: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not retrieve match data.');
    }
  }
}
