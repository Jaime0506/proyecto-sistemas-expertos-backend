import { Injectable, HttpStatus, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from './entities/rule.entity';
import { CreateRuleDto } from './dtos/create-rule.dto';
import { UpdateRuleDto } from './dtos/update-rule.dto';

@Injectable()
export class RulesService {
	constructor(
		@InjectRepository(Rule)
		private readonly ruleRepository: Repository<Rule>,
	) {}

	async create(dto: CreateRuleDto) {
		try {
			// Verificar que el código no exista
			const existingRule = await this.ruleRepository.findOne({
				where: { code: dto.code },
			});

			if (existingRule) {
				throw new ConflictException(`La regla con código ${dto.code} ya existe`);
			}

			const rule = this.ruleRepository.create(dto);
			const result = await this.ruleRepository.save(rule);

			return {
				status: HttpStatus.CREATED,
				data: result,
				message: 'Regla creada exitosamente',
			};
		} catch (error) {
			console.error('Error creating rule:', error);
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al crear la regla');
		}
	}

	async findAll() {
		try {
			const rules = await this.ruleRepository.find({
				relations: ['failure', 'creator', 'updater', 'rule_facts'],
				order: { priority: 'ASC', code: 'ASC' },
			});

			return {
				status: HttpStatus.OK,
				data: rules,
				message: 'Reglas obtenidas exitosamente',
			};
		} catch (error) {
			console.error('Error retrieving rules:', error);
			throw new InternalServerErrorException('Error al obtener las reglas');
		}
	}

	async findOne(id: number) {
		try {
			const rule = await this.ruleRepository.findOne({
				where: { id },
				relations: ['failure', 'creator', 'updater', 'rule_facts', 'rule_facts.fact'],
			});

			if (!rule) {
				throw new NotFoundException(`Regla con ID ${id} no encontrada`);
			}

			return {
				status: HttpStatus.OK,
				data: rule,
				message: 'Regla obtenida exitosamente',
			};
		} catch (error) {
			console.error('Error retrieving rule:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al obtener la regla');
		}
	}

	async findByCode(code: string) {
		try {
			const rule = await this.ruleRepository.findOne({
				where: { code },
				relations: ['failure', 'creator', 'updater', 'rule_facts', 'rule_facts.fact'],
			});

			if (!rule) {
				throw new NotFoundException(`Regla con código ${code} no encontrada`);
			}

			return {
				status: HttpStatus.OK,
				data: rule,
				message: 'Regla obtenida exitosamente',
			};
		} catch (error) {
			console.error('Error retrieving rule by code:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al obtener la regla');
		}
	}

	async update(id: number, dto: UpdateRuleDto) {
		try {
			const existingRule = await this.ruleRepository.findOne({
				where: { id },
			});

			if (!existingRule) {
				throw new NotFoundException(`Regla con ID ${id} no encontrada`);
			}

			// Si se está actualizando el código, verificar que no exista otro con ese código
			if (dto.code && dto.code !== existingRule.code) {
				const codeExists = await this.ruleRepository.findOne({
					where: { code: dto.code },
				});

				if (codeExists) {
					throw new ConflictException(`La regla con código ${dto.code} ya existe`);
				}
			}

			await this.ruleRepository.update(id, dto);
			const updatedRule = await this.ruleRepository.findOne({
				where: { id },
				relations: ['failure', 'creator', 'updater', 'rule_facts'],
			});

			return {
				status: HttpStatus.OK,
				data: updatedRule,
				message: 'Regla actualizada exitosamente',
			};
		} catch (error) {
			console.error('Error updating rule:', error);
			if (error instanceof NotFoundException || error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al actualizar la regla');
		}
	}

	async remove(id: number) {
		try {
			const existingRule = await this.ruleRepository.findOne({
				where: { id },
			});

			if (!existingRule) {
				throw new NotFoundException(`Regla con ID ${id} no encontrada`);
			}

			const result = await this.ruleRepository.delete(id);

			return {
				status: HttpStatus.OK,
				data: { affected: result.affected },
				message: 'Regla eliminada exitosamente',
			};
		} catch (error) {
			console.error('Error deleting rule:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al eliminar la regla');
		}
	}
}
