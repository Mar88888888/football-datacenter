import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
import { Team } from '../team/team.entity';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
  ) {}

  async saveCoach(coach: Coach, team: Team): Promise<void> {
        coach.team = team;
        await this.coachRepository.save(coach);
  }

  async getAll(){
    let coaches = await this.coachRepository.find({ relations: ['team'] });
    if(!coaches || coaches.length == 0){
      throw new NotFoundException('Coaches not found')
    }
    return coaches;
  }

  async findOne(coachId: number){
    let coach = await this.coachRepository.findOne({where: { id: coachId }});
    if(!coach){
      throw new NotFoundException(`Coach with id ${coachId} not found`)
    }
    return coach;
  }
  
  async getFromTeam (teamId: number){
    let coach = await this.coachRepository
      .createQueryBuilder('coach')
      .innerJoinAndSelect('coach.team', 'team', 'team.id = :teamId', { teamId })
      .getOne();
    if(!coach){
      throw new NotFoundException(`Coach from team with id ${teamId} not found`)
    }
    return coach;
  }
}
