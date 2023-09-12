import { Test, TestingModule } from '@nestjs/testing';
import { LawsuitService } from './lawsuit.service';

describe('LawsuitService', () => {
  let service: LawsuitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LawsuitService],
    }).compile();

    service = module.get<LawsuitService>(LawsuitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
