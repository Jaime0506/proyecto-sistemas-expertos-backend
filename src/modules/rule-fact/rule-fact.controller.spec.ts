import { Test, TestingModule } from '@nestjs/testing';
import { RuleFactController } from './rule-fact.controller';
import { RuleFactService } from './rule-fact.service';

describe('RuleFactController', () => {
  let controller: RuleFactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleFactController],
      providers: [RuleFactService],
    }).compile();

    controller = module.get<RuleFactController>(RuleFactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
