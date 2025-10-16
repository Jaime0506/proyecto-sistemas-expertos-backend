import { ApiProperty } from '@nestjs/swagger';

export class FactsFailureResponseDto {
	@ApiProperty({ description: 'ID de la relación', example: 1 })
	id: number;

	@ApiProperty({ description: 'ID del hecho', example: 1 })
	fact_id: number;

	@ApiProperty({ description: 'ID de la falla', example: 1 })
	failure_id: number;

	@ApiProperty({ 
		description: 'Información del hecho',
		type: 'object',
		properties: {
			id: { type: 'number', example: 1 },
			code: { type: 'string', example: 'F001' },
			description: { type: 'string', example: 'Descripción del hecho' }
		}
	})
	fact: {
		id: number;
		code: string;
		description: string;
	};

	@ApiProperty({ 
		description: 'Información de la falla',
		type: 'object',
		properties: {
			id: { type: 'number', example: 1 },
			name: { type: 'string', example: 'Falla de prueba' },
			description: { type: 'string', example: 'Descripción de la falla' }
		}
	})
	failure: {
		id: number;
		name: string;
		description?: string;
	};
}
