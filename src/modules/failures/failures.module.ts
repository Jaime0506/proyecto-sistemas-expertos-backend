import { Module } from '@nestjs/common';
import { FailuresService } from './failures.service';
import { FailuresController } from './failures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Failure } from './entities/failure.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Failure])],
	controllers: [FailuresController],
	providers: [FailuresService],
})
export class FailuresModule {}
