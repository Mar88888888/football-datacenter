import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CompetitionService } from '../competition/competition.service';
import { GlobalRequestCounterService } from '../global-request-counter.service';
import { Coach } from '../coach/coach.entity';
import { Competition } from '../competition/competition.entity';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TeamService {

  private readonly logger = new Logger(TeamService.name);
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    private readonly competitionService: CompetitionService,
    private readonly globalRequestCounterService: GlobalRequestCounterService
  ) {}

  async fetchAndStoreTeams(): Promise<void> {
    try {
      const competitions = await this.competitionService.getAllCompetitions();
      for (const comp of competitions) {

        // Parsing teams from competitions
        const url = `https://api.football-data.org/v4/competitions/${comp.id}/teams`;
        const response = await this.httpService.get(url, {
          headers: { 'X-Auth-Token': process.env.API_KEY },
        }).toPromise();

        await this.globalRequestCounterService.incrementCounter();
        

        // Saving teams, connected with comps and coaches into db
        const teams = response.data.teams;
        for (const teamData of teams) {
          let team = await this.teamRepository.findOne({
            where: { id: teamData.id },
            relations: ['competitions', 'coach']
          });

          if (!team) {
            team = new Team();
            team.id = teamData.id;
          }

          team.name = teamData.name;
          team.shortName = teamData.shortName;
          team.tla = teamData.tla;
          team.crest = teamData.crestUrl;
          team.address = teamData.address;
          team.website = teamData.website;
          team.founded = teamData.founded;
          team.clubColors = teamData.clubColors;
          team.venue = teamData.venue;

          const coachData = teamData.coach;
          if (coachData && coachData.id) {
            let coach = team.coach;
            if (!coach || !coach.id) {
              coach = new Coach();
              team.coach = coach;
            }
            coach.name = coachData.name;
            coach.nationality = coachData.nationality;
            coach.dateOfBirth = coachData.dateOfBirth;
            coach.team = team;
          }

          const competition = await this.competitionRepository.findOne({ where: { id: comp.id } });
          if (competition) {
            if (!team.competitions) {
              team.competitions = [];
            }
            if (!team.competitions.some(c => c.id === competition.id)) {
              team.competitions.push(competition);
            }
          } else {
            this.logger.error(`Competition with id ${comp.id} not found`);
            continue;
          }

          await this.teamRepository.save(team);
        }
      }
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async getAllTeams(): Promise<Team[]> {
    let team = await this.teamRepository.find({ relations: ['coach', 'competitions'] });
    if(!team || team.length == 0){
      throw new NotFoundException('Team not found')
    }
    return team;
  }

  async findOne(teamId: number){
    let team = await this.teamRepository.findOne({where: { id: teamId }});
    if(!team){
      throw new NotFoundException(`Team with id ${teamId} not found`)
    }
    return team;
  }



  async searchByName(name: string): Promise<Team[]> {
    return await this.teamRepository
      .createQueryBuilder('team')
      .where('team.name ILIKE :name', { name: `%${name}%` })
      .getMany();
  }
}
