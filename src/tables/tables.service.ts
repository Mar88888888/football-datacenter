import { Injectable } from '@nestjs/common';
import { retry } from 'rxjs';
const axios = require("axios");
const cheerio = require("cheerio");

@Injectable()
export class TablesService {
  private LeagueTable = [];

  async getLeagueTable(league: string){
    this.LeagueTable = [];
    const url = `https://www.bbc.com/sport/football/${league}/table`;
    const response = await axios(url);
    console.log(response.status)
    const html = await response.data;
    const $ = cheerio.load(html);
    const allRows = $("table > tbody > tr");
    allRows.each((index, element) => {
      const tds = $(element).find('td');
      const team = $(tds[1]).text();
      const played = $(tds[2]).text();
      const won = $(tds[3]).text();
      const drawn = $(tds[4]).text();
      const lost = $(tds[5]).text();
      const gf = $(tds[6]).text();
      const against = $(tds[7]).text();
      const gd = $(tds[8]).text();
      const points = $(tds[9]).text();
      this.LeagueTable.push({
        'Team': team,
        'Played': played,
        'Won': won,
        'Drawn': drawn,
        'Lost': lost,
        'Goals For': gf,
        'Goals Against': against,
        'Goals Difference': gd,
        'Points': points,
      })
    });
    return this.LeagueTable;
  }
}
