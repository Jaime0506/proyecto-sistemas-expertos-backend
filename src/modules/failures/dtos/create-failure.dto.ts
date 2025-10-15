import { IsString, IsOptional } from 'class-validator';

export class CreateFailureDto {
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;
}
