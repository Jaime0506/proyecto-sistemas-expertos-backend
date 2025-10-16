import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FactsFailureService } from './facts-failure.service';
import { CreateFactsFailureDto } from './dto/create-facts-failure.dto';
import { UpdateFactsFailureDto } from './dto/update-facts-failure.dto';
import { FactsFailureResponseDto } from './dto/facts-failure-response.dto';

@ApiTags('facts-failure')
@Controller('facts-failure')
export class FactsFailureController {
  constructor(private readonly factsFailureService: FactsFailureService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva relación hecho-falla' })
  @ApiResponse({ status: 201, description: 'Relación creada exitosamente', type: FactsFailureResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Hecho, falla o regla no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una relación entre este hecho y esta falla' })
  async create(@Body() createFactsFailureDto: CreateFactsFailureDto): Promise<FactsFailureResponseDto> {
    return await this.factsFailureService.create(createFactsFailureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las relaciones hecho-falla' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones obtenida exitosamente', type: [FactsFailureResponseDto] })
  async findAll(): Promise<FactsFailureResponseDto[]> {
    return await this.factsFailureService.findAll();
  }

  @Get('fact/:factId')
  @ApiOperation({ summary: 'Obtener todas las relaciones de un hecho específico' })
  @ApiParam({ name: 'factId', description: 'ID del hecho' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones del hecho obtenida exitosamente', type: [FactsFailureResponseDto] })
  async findByFactId(@Param('factId', ParseIntPipe) factId: number): Promise<FactsFailureResponseDto[]> {
    return await this.factsFailureService.findByFactId(factId);
  }

  @Get('failure/:failureId')
  @ApiOperation({ summary: 'Obtener todas las relaciones de una falla específica' })
  @ApiParam({ name: 'failureId', description: 'ID de la falla' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones de la falla obtenida exitosamente', type: [FactsFailureResponseDto] })
  async findByFailureId(@Param('failureId', ParseIntPipe) failureId: number): Promise<FactsFailureResponseDto[]> {
    return await this.factsFailureService.findByFailureId(failureId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una relación hecho-falla por ID' })
  @ApiParam({ name: 'id', description: 'ID de la relación' })
  @ApiResponse({ status: 200, description: 'Relación obtenida exitosamente', type: FactsFailureResponseDto })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FactsFailureResponseDto> {
    return await this.factsFailureService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una relación hecho-falla' })
  @ApiParam({ name: 'id', description: 'ID de la relación' })
  @ApiResponse({ status: 200, description: 'Relación actualizada exitosamente', type: FactsFailureResponseDto })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFactsFailureDto: UpdateFactsFailureDto
  ): Promise<FactsFailureResponseDto> {
    return await this.factsFailureService.update(id, updateFactsFailureDto);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una relación hecho-falla' })
  @ApiParam({ name: 'id', description: 'ID de la relación' })
  @ApiResponse({ status: 200, description: 'Relación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.factsFailureService.remove(id);
    return { message: 'Relación eliminada exitosamente' };
  }
}
