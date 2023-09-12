import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LawsuitController } from './lawsuit.controller';
import { LawsuitService } from './lawsuit.service';

@Module({
  imports: [HttpModule],
  controllers: [LawsuitController],
  providers: [LawsuitService],
})
export class LawsuitModule {}
