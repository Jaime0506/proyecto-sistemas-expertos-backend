import { ApiProperty } from '@nestjs/swagger';

export class ProductRecommendationDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'CREDITO_HIPOTECARIO' })
  name: string;

  @ApiProperty({ description: 'Descripción del producto', example: 'Crédito hipotecario para vivienda' })
  description: string;

  @ApiProperty({ description: 'Monto máximo aprobado', example: 160000000 })
  max_amount: number;

  @ApiProperty({ description: 'Plazo máximo en meses', example: 240 })
  max_term_months: number;

  @ApiProperty({ description: 'Tasa de interés', example: 1.2 })
  interest_rate: number;

  @ApiProperty({ description: 'Condiciones especiales', example: ['Requiere enganche del 20%'] })
  special_conditions: string[];

  @ApiProperty({ description: 'Nivel de confianza', example: 95 })
  confidence: number;
}

export class RuleExecutionDto {
  @ApiProperty({ description: 'Código de la regla', example: 'R001' })
  rule_code: string;

  @ApiProperty({ description: 'Nombre de la regla', example: 'Verificación de Edad' })
  rule_name: string;

  @ApiProperty({ description: 'Categoría de la regla', example: 'ADMISIBILIDAD' })
  category: string;

  @ApiProperty({ description: 'Resultado de la regla', example: 'PASS' })
  result: string;

  @ApiProperty({ description: 'Explicación del resultado', example: 'Edad dentro del rango permitido' })
  explanation: string;

  @ApiProperty({ description: 'Tiempo de ejecución en ms', example: 15.5 })
  execution_time_ms: number;
}

export class EvaluationResultDto {
  @ApiProperty({ description: 'ID de la sesión de evaluación', example: 'eval_20241216_001' })
  session_id: string;

  @ApiProperty({ description: 'Decisión final', example: 'APROBADO' })
  final_decision: string;

  @ApiProperty({ description: 'Perfil de riesgo', example: 'BAJO' })
  risk_profile: string;

  @ApiProperty({ description: 'Score de confianza', example: 95.5 })
  confidence_score: number;

  @ApiProperty({ description: 'Explicación de la decisión', example: 'Cliente cumple todos los criterios de admisibilidad' })
  explanation: string;

  @ApiProperty({ description: 'Facts detectados', example: ['FACT_EDAD_18_75', 'FACT_INGRESOS_MIN_1_SMMLV'] })
  facts_detected: string[];

  @ApiProperty({ description: 'Failures detectados', example: [] })
  failures_detected: string[];

  @ApiProperty({ description: 'Productos recomendados', type: [ProductRecommendationDto] })
  recommended_products: ProductRecommendationDto[];

  @ApiProperty({ description: 'Ejecución de reglas', type: [RuleExecutionDto] })
  rule_executions: RuleExecutionDto[];

  @ApiProperty({ description: 'Tiempo total de evaluación en ms', example: 250.5 })
  total_execution_time_ms: number;

  @ApiProperty({ description: 'Timestamp de la evaluación', example: '2024-12-16T10:30:00Z' })
  evaluated_at: string;
}
