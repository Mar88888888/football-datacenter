import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { SchedulerService } from './scheduler.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule, UsersModule, MailModule, MatchesModule],
  providers: [
    SchedulerService,
  ],
})
export class SchedulerModule {}
