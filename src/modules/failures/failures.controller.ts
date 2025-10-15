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
import { FailuresService } from './failures.service';
import { CreateFailureDto } from './dtos/create-failure.dto';
import { UpdateFailureDto } from './dtos/update-failure.dto';

@Controller('failures')
export class FailuresController {
	constructor(private readonly svc: FailuresService) {}

	@Post()
	create(@Body() dto: CreateFailureDto) {
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
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateFailureDto,
	) {
		return this.svc.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.svc.remove(id);
	}
}
