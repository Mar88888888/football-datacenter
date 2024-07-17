import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { Player } from './player.entity';
import { TeamService } from '../team/teams.service';
import { Team } from '../team/team.entity';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Injectable()
export class PlayerService {

  private readonly logger = new Logger(TeamService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly teamService: TeamService,
    private readonly globalRequestCounterService: GlobalRequestCounterService,

  ) {}


  async fetchAndStorePlayers(): Promise<void> {
    const teamsId = await this.teamService.fetchAvailableTeamsId();
    let apiurl = `https://api.football-data.org/v4/persons/`;
    this.logger.log(`GET: ${apiurl}`);
    let newteam = false;
    for (const id of teamsId) {

      if(id == 6684){
        newteam = true;
      }
      if(newteam){
        this.logger.log(`https://api.football-data.org/v4/teams/${id}`)
        let response = await this.httpService.get(`https://api.football-data.org/v4/teams/${id}`, {
            headers: { 'X-Auth-Token': process.env.API_KEY },
          }).toPromise();
  
  
        await this.globalRequestCounterService.incrementCounter();
  
  
        const team = response.data;
  
        if(team && team.squad){
          for (const player of team.squad) {
            const response = await this.httpService.get(apiurl + player.id, {
              headers: { 'X-Auth-Token': process.env.API_KEY },
            }).toPromise();
    
            await this.globalRequestCounterService.incrementCounter();
  
            const playerData = response.data;
            playerData.currentTeamId = team.id;
            if(!playerData.nationality){
              playerData.nationality = 'unknown';
            }
            if(!playerData.position){
              playerData.position = 'unknown';
            }
            await this.playerRepository.save(playerData);
          }
          this.logger.log(`${team.name} completed`)
        }
      }
    }
  }
}
