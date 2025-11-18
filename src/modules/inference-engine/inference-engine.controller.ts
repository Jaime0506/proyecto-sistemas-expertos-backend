import { Controller, Post, Get, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InferenceEngineService } from './inference-engine.service';
import { StartEvaluationDto } from './dto/start-evaluation.dto';
import { EvaluationResultDto } from './dto/evaluation-result.dto';
import { TestEvaluationDto } from './dto/test-evaluation.dto';

@ApiTags('inference-engine')
@Controller('inference-engine')
export class InferenceEngineController {
  constructor(private readonly inferenceEngineService: InferenceEngineService) {}

  @Post('evaluate')
  @ApiOperation({ 
    summary: 'Evaluar usuario con el sistema experto',
    description: 'Ejecuta el motor de inferencia para evaluar un usuario y generar recomendaciones de productos crediticios'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Evaluación completada exitosamente',
    type: EvaluationResultDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async evaluateUser(@Body() evaluationData: StartEvaluationDto): Promise<EvaluationResultDto> {
    return await this.inferenceEngineService.evaluateUser(evaluationData);
  }

  @Get('history/:userId')
  @ApiOperation({ 
    summary: 'Obtener historial de evaluaciones de un usuario',
    description: 'Retorna las últimas 10 evaluaciones realizadas por un usuario específico'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial obtenido exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          session_id: { type: 'string', example: 'eval_20241216_001' },
          final_decision: { type: 'string', example: 'APROBADO' },
          risk_profile: { type: 'string', example: 'BAJO' },
          confidence_score: { type: 'number', example: 95.5 },
          created_at: { type: 'string', example: '2024-12-16T10:30:00Z' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async getEvaluationHistory(@Param('userId', ParseIntPipe) userId: number) {
    return await this.inferenceEngineService.getEvaluationHistory(userId);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas del motor de inferencia',
    description: 'Retorna estadísticas de rendimiento y uso del motor de inferencia'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        total_evaluations: { type: 'number', example: 150 },
        completed_evaluations: { type: 'number', example: 145 },
        failed_evaluations: { type: 'number', example: 5 },
        success_rate: { type: 'number', example: 96.67 },
        average_confidence: { type: 'number', example: 87.5 }
      }
    }
  })
  async getEngineStats() {
    return await this.inferenceEngineService.getEngineStats();
  }

  @Get('session/:sessionId')
  @ApiOperation({ 
    summary: 'Obtener detalles de una sesión de evaluación',
    description: 'Retorna los detalles completos de una sesión de evaluación específica'
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'ID de la sesión de evaluación',
    example: 'eval_20241216_001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        session_id: { type: 'string', example: 'eval_20241216_001' },
        user_id: { type: 'number', example: 1 },
        input_data: { type: 'object' },
        facts_detected: { type: 'array', items: { type: 'string' } },
        evaluation_result: { type: 'object' },
        final_decision: { type: 'string', example: 'APROBADO' },
        risk_profile: { type: 'string', example: 'BAJO' },
        recommended_products: { type: 'array' },
        explanation: { type: 'string' },
        confidence_score: { type: 'number', example: 95.5 },
        status: { type: 'string', example: 'COMPLETED' },
        created_at: { type: 'string', example: '2024-12-16T10:30:00Z' },
        updated_at: { type: 'string', example: '2024-12-16T10:30:15Z' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sesión no encontrada' 
  })
  async getEvaluationSession(@Param('sessionId') sessionId: string) {
    const session = await this.inferenceEngineService.getEvaluationSessionBySessionId(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }
    return session;
  }

  @Get('evaluations')
  @ApiOperation({ 
    summary: 'Obtener todas las evaluaciones (Panel Administrativo)',
    description: 'Retorna todas las evaluaciones realizadas en el sistema con paginación'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de resultados (default: 50)',
    example: 50
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number, 
    description: 'Número de resultados a omitir (default: 0)',
    example: 0
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Evaluaciones obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        evaluations: {
          type: 'array',
          items: { type: 'object' }
        },
        total: { type: 'number', example: 150 }
      }
    }
  })
  async getAllEvaluations(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return await this.inferenceEngineService.getAllEvaluations(
      limit ? parseInt(limit.toString(), 10) : 50,
      offset ? parseInt(offset.toString(), 10) : 0
    );
  }

  @Post('test')
  @ApiOperation({ 
    summary: 'Probar el motor de inferencia con datos de prueba',
    description: 'Endpoint para probar el motor de inferencia con datos predefinidos'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Prueba completada exitosamente',
    type: EvaluationResultDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de prueba inválidos' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async testEngine(@Body() testData: TestEvaluationDto): Promise<EvaluationResultDto> {
    console.log('🧪 Iniciando prueba del motor de inferencia...', testData);
    
    const evaluationRequest: StartEvaluationDto = {
      input_data: testData,
      session_id: `test_${Date.now()}`
    };

    return await this.inferenceEngineService.evaluateUser(evaluationRequest);
  }
}
