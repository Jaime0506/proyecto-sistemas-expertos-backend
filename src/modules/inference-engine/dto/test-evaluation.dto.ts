import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestEvaluationDto {
  @ApiProperty({ description: 'Edad del solicitante', example: 30 })
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @ApiProperty({ description: 'Ingresos mensuales netos', example: 3000000 })
  @IsNotEmpty()
  @IsNumber()
  monthly_income: number;

  @ApiProperty({ description: 'Score crediticio', example: 750 })
  @IsNotEmpty()
  @IsNumber()
  credit_score: number;

  @ApiProperty({ description: 'Estado laboral', example: 'employed' })
  @IsNotEmpty()
  @IsString()
  employment_status: string;

  @ApiProperty({ description: 'Finalidad del crédito', example: 'vivienda' })
  @IsNotEmpty()
  @IsString()
  credit_purpose: string;

  @ApiProperty({ description: 'Monto solicitado', example: 200000000 })
  @IsNotEmpty()
  @IsNumber()
  requested_amount: number;

  @ApiProperty({ description: 'Relación deuda/ingreso', example: 0.3, required: false })
  @IsOptional()
  @IsNumber()
  debt_to_income_ratio?: number;

  @ApiProperty({ description: 'Días máximos de mora', example: 15, required: false })
  @IsOptional()
  @IsNumber()
  max_days_delinquency?: number;

  @ApiProperty({ description: 'Antigüedad laboral en meses', example: 24, required: false })
  @IsOptional()
  @IsNumber()
  employment_tenure_months?: number;

  @ApiProperty({ description: 'Relación cuota/ingreso', example: 0.25, required: false })
  @IsOptional()
  @IsNumber()
  payment_to_income_ratio?: number;

  @ApiProperty({ description: 'Porcentaje de enganche', example: 20, required: false })
  @IsOptional()
  @IsNumber()
  down_payment_percentage?: number;

  @ApiProperty({ description: 'Tiene codeudor', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  has_co_borrower?: boolean;

  @ApiProperty({ description: 'Ingresos del codeudor', example: 2500000, required: false })
  @IsOptional()
  @IsNumber()
  co_borrower_income?: number;

  @ApiProperty({ description: 'Es microempresa', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_microenterprise?: boolean;

  @ApiProperty({ description: 'Actividad económica', example: 'comercio', required: false })
  @IsOptional()
  @IsString()
  economic_activity?: string;

  @ApiProperty({ description: 'Es PEP', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_pep?: boolean;

  @ApiProperty({ description: 'Aprobación comité PEP', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  pep_committee_approval?: boolean;

  @ApiProperty({ description: 'Consultas recientes', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  recent_inquiries?: number;

  @ApiProperty({ description: 'Antigüedad como cliente en meses', example: 36, required: false })
  @IsOptional()
  @IsNumber()
  customer_tenure_months?: number;

  @ApiProperty({ description: 'Cumplimiento histórico %', example: 98, required: false })
  @IsOptional()
  @IsNumber()
  historical_compliance?: number;

  @ApiProperty({ description: 'Es empleado de empresa convenio', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_convention_employee?: boolean;

  @ApiProperty({ description: 'Descuento nómina autorizado', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  payroll_discount_authorized?: boolean;

  @ApiProperty({ description: 'Tipo de vinculación', example: 'employed', required: false })
  @IsOptional()
  @IsString()
  employment_type?: string;

  @ApiProperty({ description: 'Monto de pensión', example: 1500000, required: false })
  @IsOptional()
  @IsNumber()
  pension_amount?: number;

  @ApiProperty({ description: 'Es pensión legal', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_legal_pension?: boolean;
}
