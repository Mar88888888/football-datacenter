import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamService } from './teams.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [TeamsController],
  providers: [    
    {
      provide: 'ITeamService',
      useClass: TeamService,
    },
  ],
  exports: ['ITeamService']
})
export class TeamsModule {}
