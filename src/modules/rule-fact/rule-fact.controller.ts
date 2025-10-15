import { Controller } from '@nestjs/common';
import { RuleFactService } from './rule-fact.service';

@Controller('rule-fact')
export class RuleFactController {
  constructor(private readonly ruleFactService: RuleFactService) {}
}
