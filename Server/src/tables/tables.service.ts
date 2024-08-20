import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const axios = require("axios");
const cheerio = require("cheerio");

@Injectable()
export class TablesService {


  private LeagueTable = [];
  private leagues = [];


  constructor(){
    this.loadLeagues();
  }

  async getLeagueTable(leagueid: number){
    let league = this.getName(leagueid);

    this.LeagueTable = [];
    const url = `https://www.bbc.com/sport/football/${league}/table`;
    const response = await axios(url);
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

  private loadLeagues() {
    const filePath = process.env.NODE_ENV === 'production' 
      ? path.resolve(__dirname, 'tables', 'leagues.csv') 
      : path.resolve(__dirname, '../../', 'src', 'tables', 'leagues.csv');
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        this.leagues.push(row);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
  }

  getName(id: number): string | undefined {
    const league = this.leagues.find((league) => parseInt(league.id) === id);
    return league?.league_name;
  }
}
