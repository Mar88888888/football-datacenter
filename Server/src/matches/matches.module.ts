import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { HttpModule} from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService]
})
export class MatchesModule {}
