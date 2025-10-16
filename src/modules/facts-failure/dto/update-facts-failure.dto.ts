import { PartialType } from '@nestjs/swagger';
import { CreateFactsFailureDto } from './create-facts-failure.dto';

export class UpdateFactsFailureDto extends PartialType(CreateFactsFailureDto) {}
