import { Test, TestingModule } from '@nestjs/testing';
import { LawsuitController } from './lawsuit.controller';
import { LawsuitService } from './lawsuit.service';

describe('LawsuitController', () => {
  let controller: LawsuitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LawsuitController],
      providers: [LawsuitService],
    }).compile();

    controller = module.get<LawsuitController>(LawsuitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
