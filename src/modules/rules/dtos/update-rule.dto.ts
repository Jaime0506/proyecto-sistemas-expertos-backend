import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRuleDto {
	@ApiProperty({ description: 'ID de la regla', example: 1 })
	id: number;

	@ApiProperty({ description: 'Código único de la regla', example: 'R001', required: false })
	@IsOptional()
	@IsString()
	code?: string;

	@ApiProperty({ description: 'Nombre de la regla', example: 'Verificación de Edad', required: false })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({ description: 'Categoría de la regla', example: 'ADMISIBILIDAD', required: false })
	@IsOptional()
	@IsString()
	category?: string;

	@ApiProperty({ description: 'ID del failure asociado', example: 1, required: false })
	@IsOptional()
	@IsNumber()
	failure_id?: number;

	@ApiProperty({ description: 'Tipo de lógica', example: 'AND', required: false })
	@IsOptional()
	@IsString()
	logic_type?: string;

	@ApiProperty({ description: 'Descripción de la regla', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Prioridad de la regla', example: 1, required: false })
	@IsOptional()
	@IsNumber()
	priority?: number;

	@ApiProperty({ description: 'ID del experto que actualiza la regla', required: false })
	@IsOptional()
	@IsNumber()
	updated_by?: number;
}

