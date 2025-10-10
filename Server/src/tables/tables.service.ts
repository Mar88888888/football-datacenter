import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TablesService {
  async getLeagueTable(tournamentId: number): Promise<any> {
    let leagueTable = [];

    try {
      const standingsUrl = `/v4/competitions/${tournamentId}/standings`;
      const standingsResponse = await axios.get(standingsUrl);
      const standings = standingsResponse.data.standings.table;
      if (standings && standings.length > 0) {
        const table = standings[0].rows;

        table.forEach((row: any) => {
          leagueTable.push({
            Team: row.team.name,
            Played: row.matches,
            Won: row.wins,
            Drawn: row.draws,
            Lost: row.losses,
            'Goals For': row.scoresFor,
            'Goals Against': row.scoresAgainst,
            'Goals Difference': row.scoresFor - row.scoresAgainst,
            Points: row.points,
          });
        });
      }

      return leagueTable;
    } catch (error) {
      console.log('Error fetching league table:', error);
      return [];
    }
  }
}
