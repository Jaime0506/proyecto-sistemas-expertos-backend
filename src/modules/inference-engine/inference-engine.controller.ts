import { Controller, Post, Get, Body, Param, ParseIntPipe, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InferenceEngineService } from './inference-engine.service';
import { StartEvaluationDto } from './dto/start-evaluation.dto';
import { EvaluationResultDto } from './dto/evaluation-result.dto';
import { TestEvaluationDto } from './dto/test-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/strategy/jwt.strategy';
import { UserType } from '../auth/entities/refresh-token.entity';

@ApiTags('inference-engine')
@ApiBearerAuth()
@Controller('inference-engine')
@UseGuards(JwtAuthGuard)
export class InferenceEngineController {
  constructor(private readonly inferenceEngineService: InferenceEngineService) {}

  @Post('evaluate')
  @UseGuards(RolesGuard)
  @Roles(UserType.EXPERTO)
  @ApiOperation({ 
    summary: 'Evaluar usuario con el sistema experto',
    description: 'Ejecuta el motor de inferencia para evaluar un usuario y generar recomendaciones de productos crediticios. Solo para Expertos.'
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
    status: 403, 
    description: 'No tienes permisos para acceder a este recurso' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async evaluateUser(@Body() evaluationData: StartEvaluationDto): Promise<EvaluationResultDto> {
    return await this.inferenceEngineService.evaluateUser(evaluationData);
  }

  @Get('my-history')
  @UseGuards(RolesGuard)
  @Roles(UserType.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener mi historial de evaluaciones (Solo Clientes)',
    description: 'Retorna las últimas 10 evaluaciones realizadas por el cliente autenticado.'
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
    status: 403, 
    description: 'No tienes permisos para acceder a este recurso' 
  })
  async getMyEvaluationHistory(@CurrentUser() user: RequestUser) {
    return await this.inferenceEngineService.getEvaluationHistory(user.id);
  }

  @Get('history/:clienteId')
  @UseGuards(RolesGuard)
  @Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener historial de evaluaciones de un cliente (Expertos y Administradores)',
    description: 'Retorna las últimas 10 evaluaciones realizadas por un cliente específico. Solo para Expertos y Administradores.'
  })
  @ApiParam({ 
    name: 'clienteId', 
    description: 'ID del cliente',
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
    status: 403, 
    description: 'No tienes permisos para ver este historial' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente no encontrado' 
  })
  async getEvaluationHistory(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @CurrentUser() user: RequestUser
  ) {
    return await this.inferenceEngineService.getEvaluationHistory(clienteId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener estadísticas del motor de inferencia',
    description: 'Retorna estadísticas de rendimiento y uso del motor de inferencia. Solo para Expertos y Administradores.'
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
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para acceder a este recurso' 
  })
  async getEngineStats() {
    return await this.inferenceEngineService.getEngineStats();
  }

  @Get('my-session/:sessionId')
  @UseGuards(RolesGuard)
  @Roles(UserType.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener detalles de mi sesión de evaluación (Solo Clientes)',
    description: 'Retorna los detalles completos de una sesión de evaluación del cliente autenticado.'
  })
  @ApiParam({ 
    name: 'sessionId', 
    description: 'ID de la sesión de evaluación',
    example: 'eval_20241216_001'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión obtenida exitosamente'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para ver esta sesión' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sesión no encontrada' 
  })
  async getMyEvaluationSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser
  ) {
    const session = await this.inferenceEngineService.getEvaluationSessionBySessionId(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }
    
    // Verificar que la sesión pertenece al cliente autenticado
    if (session.cliente_id !== user.id) {
      throw new ForbiddenException('Solo puedes ver tus propias sesiones de evaluación');
    }
    
    return session;
  }

  @Get('session/:sessionId')
  @UseGuards(RolesGuard)
  @Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener detalles de una sesión de evaluación (Expertos y Administradores)',
    description: 'Retorna los detalles completos de una sesión de evaluación específica. Solo para Expertos y Administradores.'
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
        cliente_id: { type: 'number', example: 1 },
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
    status: 403, 
    description: 'No tienes permisos para ver esta sesión' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Sesión no encontrada' 
  })
  async getEvaluationSession(
    @Param('sessionId') sessionId: string
  ) {
    const session = await this.inferenceEngineService.getEvaluationSessionBySessionId(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }
    
    return session;
  }

  @Get('evaluations')
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener todas las evaluaciones (Panel Administrativo)',
    description: 'Retorna todas las evaluaciones realizadas en el sistema con paginación. Solo para Administradores.'
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
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para acceder a este recurso' 
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
  @UseGuards(RolesGuard)
  @Roles(UserType.EXPERTO)
  @ApiOperation({ 
    summary: 'Probar el motor de inferencia con datos de prueba (Solo Expertos)',
    description: 'Endpoint para probar el motor de inferencia con datos predefinidos. Solo para Expertos.'
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
    status: 403, 
    description: 'No tienes permisos para acceder a este recurso' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async testEngine(@Body() testData: TestEvaluationDto): Promise<EvaluationResultDto> {
    
    const evaluationRequest: StartEvaluationDto = {
      cliente_id: 1, // Cliente de prueba por defecto
      input_data: testData,
      session_id: `test_${Date.now()}`
    };

    return await this.inferenceEngineService.evaluateUser(evaluationRequest);
  }
}
