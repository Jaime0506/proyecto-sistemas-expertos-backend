import { Test, TestingModule } from '@nestjs/testing';
import { RuleFactService } from './rule-fact.service';

describe('RuleFactService', () => {
  let service: RuleFactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleFactService],
    }).compile();

    service = module.get<RuleFactService>(RuleFactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
