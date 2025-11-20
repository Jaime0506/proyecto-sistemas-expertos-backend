import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	ParseIntPipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dtos/create-rule.dto';
import { UpdateRuleDto } from './dtos/update-rule.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../auth/entities/refresh-token.entity';

@ApiTags('Rules')
@ApiBearerAuth()
@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
	constructor(private readonly rulesService: RulesService) {}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO)
	@ApiOperation({ summary: 'Crear una nueva regla (Solo Expertos)' })
	@ApiResponse({ status: 201, description: 'Regla creada exitosamente' })
	@ApiResponse({ status: 403, description: 'Solo los expertos pueden crear reglas' })
	@ApiResponse({ status: 409, description: 'La regla con ese código ya existe' })
	create(@Body() dto: CreateRuleDto) {
		return this.rulesService.create(dto);
	}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
	@ApiOperation({ summary: 'Obtener todas las reglas (Expertos y Administradores)' })
	@ApiResponse({ status: 200, description: 'Lista de reglas obtenida exitosamente' })
	@ApiResponse({ status: 403, description: 'No tienes permisos para ver las reglas' })
	findAll() {
		return this.rulesService.findAll();
	}

	@Get('by-code/:code')
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
	@ApiOperation({ summary: 'Obtener una regla por código (Expertos y Administradores)' })
	@ApiResponse({ status: 200, description: 'Regla obtenida exitosamente' })
	@ApiResponse({ status: 403, description: 'No tienes permisos para ver las reglas' })
	@ApiResponse({ status: 404, description: 'Regla no encontrada' })
	findByCode(@Param('code') code: string) {
		return this.rulesService.findByCode(code);
	}

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO, UserType.ADMINISTRADOR)
	@ApiOperation({ summary: 'Obtener una regla por ID (Expertos y Administradores)' })
	@ApiResponse({ status: 200, description: 'Regla obtenida exitosamente' })
	@ApiResponse({ status: 403, description: 'No tienes permisos para ver las reglas' })
	@ApiResponse({ status: 404, description: 'Regla no encontrada' })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.rulesService.findOne(id);
	}

	@Put(':id')
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO)
	@ApiOperation({ summary: 'Actualizar una regla (Solo Expertos)' })
	@ApiResponse({ status: 200, description: 'Regla actualizada exitosamente' })
	@ApiResponse({ status: 403, description: 'Solo los expertos pueden actualizar reglas' })
	@ApiResponse({ status: 404, description: 'Regla no encontrada' })
	@ApiResponse({ status: 409, description: 'El código de la regla ya existe' })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateRuleDto,
	) {
		return this.rulesService.update(id, { ...dto, id });
	}

	@Delete(':id')
	@UseGuards(RolesGuard)
	@Roles(UserType.EXPERTO)
	@ApiOperation({ summary: 'Eliminar una regla (Solo Expertos)' })
	@ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
	@ApiResponse({ status: 403, description: 'Solo los expertos pueden eliminar reglas' })
	@ApiResponse({ status: 404, description: 'Regla no encontrada' })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.rulesService.remove(id);
	}
}
