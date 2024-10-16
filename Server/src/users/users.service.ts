import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string, name:string) {
    const user = this.repo.create({ email, password, name, favCompetitions: [], favTeams: [] });

    return this.repo.save(user);
  }

  async findOne(id: number) {
    if (!id) {
      return null;
    }
    let user = await this.repo.find({  where: {id}, relations: ['favCompetitions', 'favTeams'] });
    return user[0];
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  findAll() {
    return this.repo.find({ relations: ['favCompetitions', 'favTeams'] });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.repo.remove(user);
  }

  async saveVerificationToken(userId: number, token: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    user.verificationToken = token;
    await this.repo.save(user);
  }

  async findByVerificationToken(token: string): Promise<User> {
    let [user] = await this.repo.find({where: {verificationToken: token} });
    return user;
  }


  
}
