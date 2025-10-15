import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fact } from './entities/fact.entity';
import { CreateFactDto } from './dtos/create-fact.dto';
import { UpdateFactDto } from './dtos/update-fact.dto';

@Injectable()
export class FactsService {
	constructor(
		@InjectRepository(Fact)
		private readonly repo: Repository<Fact>,
	) {}

	create(dto: CreateFactDto) {
		const ent = this.repo.create(dto);
		return this.repo.save(ent);
	}

	findAll() {
		return this.repo.find();
	}

	async findOne(id: number) {
		const f = await this.repo.findOne({ where: { id } });
		if (!f) throw new NotFoundException(`Fact ${id} not found`);
		return f;
	}

	async update(id: number, dto: UpdateFactDto) {
		await this.repo.update(id, dto);
		return this.findOne(id);
	}

	async remove(id: number) {
		const res = await this.repo.delete(id);
		return { affected: res.affected };
	}
}
