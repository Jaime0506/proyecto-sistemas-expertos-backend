import { IsNotEmpty, IsOptional, IsNumber, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartEvaluationDto {
  @ApiProperty({ description: 'ID del usuario (opcional)', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ 
    description: 'Datos de entrada del usuario (respuestas del survey)', 
    example: {
      age: 30,
      monthly_income: 3000000,
      credit_score: 750,
      employment_status: 'employed',
      finalidad_credito: 'vivienda',
      monto_solicitado: 200000000
    }
  })
  @IsNotEmpty()
  @IsObject()
  input_data: any;

  @ApiProperty({ description: 'ID de sesión único', example: 'eval_20241216_001', required: false })
  @IsOptional()
  @IsString()
  session_id?: string;
}
