import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import { FactsService } from './facts.service';
import { CreateFactDto } from './dtos/create-fact.dto';
import { UpdateFactDto } from './dtos/update-fact.dto';

@Controller('facts')
export class FactsController {
	constructor(private readonly svc: FactsService) {}

	@Post()
	create(@Body() dto: CreateFactDto) {
		return this.svc.create(dto);
	}

	@Get()
	findAll() {
		return this.svc.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.svc.findOne(id);
	}

	@Put(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFactDto) {
		return this.svc.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.svc.remove(id);
	}
}
