import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { HttpModule} from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { FavouriteService } from '../users/favourite/favourite.service';

@Module({
  imports: [HttpModule, UsersModule],
  providers: [    
    {
      provide: 'IMatchesService',
      useClass: MatchesService,
    },],
  controllers: [MatchesController],
  exports: ['IMatchesService']
})
export class MatchesModule {}
