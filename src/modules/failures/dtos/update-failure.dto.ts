import { PartialType } from '@nestjs/mapped-types';
import { CreateFailureDto } from './create-failure.dto';

export class UpdateFailureDto extends PartialType(CreateFailureDto) {}
