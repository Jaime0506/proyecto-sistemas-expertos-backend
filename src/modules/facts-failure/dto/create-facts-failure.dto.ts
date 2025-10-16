import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFactsFailureDto {
	@ApiProperty({ description: 'ID del hecho', example: 1 })
	@IsNotEmpty()
	@IsNumber()
	fact_id: number;

	@ApiProperty({ description: 'ID de la falla', example: 1 })
	@IsNotEmpty()
	@IsNumber()
	failure_id: number;
}
