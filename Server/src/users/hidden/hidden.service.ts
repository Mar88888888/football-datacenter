import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHiddenComp } from './user.hiddencomp.entity';
import { CompetitionService } from '../../competitions/competition.service';
import { UsersService } from '../users.service';
import { DataStatus } from '../../common/constants';

@Injectable()
export class HiddenService {
  constructor(
    @InjectRepository(UserHiddenComp)
    private readonly hiddenCompRepo: Repository<UserHiddenComp>,
    private readonly userService: UsersService,
    private readonly compService: CompetitionService,
  ) {}

  private async getAvailableCompetitionIds(): Promise<Set<number>> {
    const result = await this.compService.findAll();
    if (result.status === DataStatus.PROCESSING || !result.data) {
      throw new ServiceUnavailableException(
        'Competition data is loading. Please try again shortly.',
      );
    }
    return new Set(result.data.map((c) => c.id));
  }

  async getHiddenComps(userId: number) {
    const [userHiddenComps, availableIds] = await Promise.all([
      this.hiddenCompRepo.find({
        where: { user: { id: userId } },
      }),
      this.getAvailableCompetitionIds(),
    ]);

    // Return stored data, filtered by available competitions
    return userHiddenComps
      .filter((hidden) => availableIds.has(hidden.competitionId))
      .map((hidden) => ({
        id: hidden.competitionId,
        name: hidden.name,
        emblem: hidden.emblem,
      }));
  }

  async hideComp(userId: number, compId: number) {
    const availableIds = await this.getAvailableCompetitionIds();

    if (!availableIds.has(compId)) {
      throw new Error('Competition is not available');
    }

    // Fetch competition data to store name and emblem
    const result = await this.compService.findById(compId);
    if (result.status === DataStatus.PROCESSING || !result.data) {
      throw new ServiceUnavailableException(
        'Competition data is loading. Please try again shortly.',
      );
    }
    const competition = result.data;

    try {
      await this.hiddenCompRepo.insert({
        user: { id: userId },
        competitionId: compId,
        name: competition.name,
        emblem: competition.emblem,
      });
    } catch (error) {
      // Handle duplicate key error (already hidden)
      if ((error as any)?.code === '23505') {
        throw new Error('Competition is already hidden');
      }
      throw error;
    }
  }

  async showComp(userId: number, compId: number) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.hiddenCompetitions) {
      throw new Error('User or hidden competitions not found.');
    }

    const hidden = user.hiddenCompetitions.find(
      (h) => h.competitionId === compId,
    );

    if (!hidden) {
      return; // Not hidden, nothing to do
    }

    await this.hiddenCompRepo.delete({ id: hidden.id });
  }
}
