import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Failure } from './entities/failure.entity';
import { CreateFailureDto } from './dtos/create-failure.dto';
import { UpdateFailureDto } from './dtos/update-failure.dto';

@Injectable()
export class FailuresService {
	constructor(
		@InjectRepository(Failure)
		private readonly repo: Repository<Failure>,
	) {}

	async create(dto: CreateFailureDto) {
		try {
			const ent = this.repo.create(dto);
			const result = await this.repo.save(ent);

			return {
				status: HttpStatus.CREATED,
				data: result,
				message: 'Failure created successfully',
			};
		} catch (error) {
			console.error(error);
			return {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				data: null,
				message: `Error creating failure`,
			};
		}
	}

	async findAll() {
		try {
			const failures = await this.repo.find();

			return {
				status: HttpStatus.OK,
				data: failures,
				message: 'Failures retrieved successfully',
			};
		} catch (error) {
			console.error(error);
			return {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				data: null,
				message: `Error retrieving failures`,
			};
		}
	}

	async findOne(id: number) {
		try {
			const failure = await this.repo.findOne({ where: { id } });

			if (!failure) {
				return {
					status: HttpStatus.NOT_FOUND,
					data: null,
					message: `Failure with ID ${id} not found`,
				};
			}

			return {
				status: HttpStatus.OK,
				data: failure,
				message: 'Failure retrieved successfully',
			};
		} catch (error) {
			console.error(error);
			return {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				data: null,
				message: `Error retrieving failure`,
			};
		}
	}

	async update(id: number, dto: UpdateFailureDto) {
		try {
			const existingFailure = await this.repo.findOne({ where: { id } });

			if (!existingFailure) {
				return {
					status: HttpStatus.NOT_FOUND,
					data: null,
					message: `Failure with ID ${id} not found`,
				};
			}

			await this.repo.update(id, dto);
			const updatedFailure = await this.repo.findOne({ where: { id } });

			return {
				status: HttpStatus.OK,
				data: updatedFailure,
				message: 'Failure updated successfully',
			};
		} catch (error) {
			console.error(error);
			return {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				data: null,
				message: `Error updating failure`,
			};
		}
	}

	async remove(id: number) {
		try {
			const existingFailure = await this.repo.findOne({ where: { id } });

			if (!existingFailure) {
				return {
					status: HttpStatus.NOT_FOUND,
					data: null,
					message: `Failure with ID ${id} not found`,
				};
			}

			const result = await this.repo.delete(id);

			return {
				status: HttpStatus.OK,
				data: { affected: result.affected },
				message: 'Failure deleted successfully',
			};
		} catch (error) {
			console.error(error);
			return {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				data: null,
				message: `Error deleting failure`,
			};
		}
	}
}
