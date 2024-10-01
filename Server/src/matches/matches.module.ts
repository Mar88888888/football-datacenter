import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { HttpModule} from '@nestjs/axios';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [HttpModule, UsersModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService]
})
export class MatchesModule {}
