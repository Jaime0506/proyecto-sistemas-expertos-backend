import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFactsFailureDto } from './dto/create-facts-failure.dto';
import { UpdateFactsFailureDto } from './dto/update-facts-failure.dto';
import { FactsFailure } from './entities/facts-failure.entity';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';

@Injectable()
export class FactsFailureService {
  constructor(
    @InjectRepository(FactsFailure)
    private factsFailureRepository: Repository<FactsFailure>,
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
    @InjectRepository(Failure)
    private failureRepository: Repository<Failure>,
  ) {}

  async create(createFactsFailureDto: CreateFactsFailureDto): Promise<FactsFailure> {
    const { fact_id, failure_id } = createFactsFailureDto;

    // Verificar que el hecho existe
    const fact = await this.factRepository.findOne({ where: { id: fact_id } });
    if (!fact) {
      throw new NotFoundException(`Fact with ID ${fact_id} not found`);
    }

    // Verificar que la falla existe
    const failure = await this.failureRepository.findOne({ where: { id: failure_id } });
    if (!failure) {
      throw new NotFoundException(`Failure with ID ${failure_id} not found`);
    }

    // Verificar que no existe ya una relación entre este hecho y esta falla
    const existingRelation = await this.factsFailureRepository.findOne({
      where: { fact_id, failure_id }
    });

    if (existingRelation) {
      throw new ConflictException(`A relation between fact ${fact_id} and failure ${failure_id} already exists`);
    }

    // Crear la nueva relación
    const factsFailure = this.factsFailureRepository.create({
      fact_id,
      failure_id,
    });

    return await this.factsFailureRepository.save(factsFailure);
  }

  async findAll(): Promise<FactsFailure[]> {
    return await this.factsFailureRepository.find({
      relations: ['fact', 'failure']
    });
  }

  async findOne(id: number): Promise<FactsFailure> {
    const factsFailure = await this.factsFailureRepository.findOne({
      where: { id },
      relations: ['fact', 'failure']
    });

    if (!factsFailure) {
      throw new NotFoundException(`FactsFailure with ID ${id} not found`);
    }

    return factsFailure;
  }

  async findByFactId(fact_id: number): Promise<FactsFailure[]> {
    return await this.factsFailureRepository.find({
      where: { fact_id },
      relations: ['fact', 'failure']
    });
  }

  async findByFailureId(failure_id: number): Promise<FactsFailure[]> {
    return await this.factsFailureRepository.find({
      where: { failure_id },
      relations: ['fact', 'failure']
    });
  }

  async update(id: number, updateFactsFailureDto: UpdateFactsFailureDto): Promise<FactsFailure> {
    const factsFailure = await this.findOne(id);

    Object.assign(factsFailure, updateFactsFailureDto);
    return await this.factsFailureRepository.save(factsFailure);
  }

  async remove(id: number): Promise<void> {
    const factsFailure = await this.findOne(id);
    await this.factsFailureRepository.remove(factsFailure);
  }
}
