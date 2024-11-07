import { Injectable } from '@nestjs/common';
import { ITablesService } from './tables.service.interface';
const axios = require("axios");

@Injectable()
export class TablesService implements ITablesService {
  async getLeagueTable(tournamentId: number): Promise<any> {
    let leagueTable = [];
    
    try {
      const tournamentUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`;
      const tournamentResponse = await axios.get(tournamentUrl);
      const currentSeasonId = tournamentResponse.data.seasons[0].id;

      const standingsUrl = `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${currentSeasonId}/standings/total`;
      const standingsResponse = await axios.get(standingsUrl);
      const standings = standingsResponse.data.standings;
      if (standings && standings.length > 0) {
        const table = standings[0].rows;

        table.forEach((row: any) => {
          leagueTable.push({
            'Team': row.team.name,
            'Played': row.matches,
            'Won': row.wins,
            'Drawn': row.draws,
            'Lost': row.losses,
            'Goals For': row.scoresFor,
            'Goals Against': row.scoresAgainst,
            'Goals Difference': row.scoresFor - row.scoresAgainst,
            'Points': row.points,
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
