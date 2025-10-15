import { Controller } from '@nestjs/common';
import { OptionFactService } from './option-fact.service';

@Controller('option-fact')
export class OptionFactController {
  constructor(private readonly optionFactService: OptionFactService) {}
}
