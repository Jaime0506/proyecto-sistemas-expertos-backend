import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemSetupService } from './system-setup.service';

@ApiTags('system-setup')
@Controller('system-setup')
export class SystemSetupController {
  constructor(private readonly systemSetupService: SystemSetupService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Configurar datos del sistema experto' })
  @ApiResponse({ 
    status: 201, 
    description: 'Sistema experto configurado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Sistema experto configurado exitosamente' },
        stats: {
          type: 'object',
          properties: {
            facts: { type: 'number', example: 50 },
            failures: { type: 'number', example: 40 },
            relations: { type: 'number', example: 200 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async setupSystemExpertData() {
    return await this.systemSetupService.setupSystemExpertData();
  }

  @Post('facts')
  @ApiOperation({ summary: 'Poblar facts del sistema experto' })
  @ApiResponse({ status: 201, description: 'Facts poblados exitosamente' })
  async populateFacts() {
    await this.systemSetupService.populateSystemFacts();
    return { message: 'Facts del sistema experto poblados exitosamente' };
  }

  @Post('failures')
  @ApiOperation({ summary: 'Poblar failures del sistema experto' })
  @ApiResponse({ status: 201, description: 'Failures poblados exitosamente' })
  async populateFailures() {
    await this.systemSetupService.populateSystemFailures();
    return { message: 'Failures del sistema experto poblados exitosamente' };
  }

  @Post('relations')
  @ApiOperation({ summary: 'Crear relaciones facts-failures' })
  @ApiResponse({ status: 201, description: 'Relaciones creadas exitosamente' })
  async createRelations() {
    await this.systemSetupService.createFactsFailuresRelations();
    return { message: 'Relaciones facts-failures creadas exitosamente' };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del sistema experto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        facts: { type: 'number', example: 50 },
        failures: { type: 'number', example: 40 },
        relations: { type: 'number', example: 200 }
      }
    }
  })
  async getStats() {
    return await this.systemSetupService.setupSystemExpertData();
  }
}
