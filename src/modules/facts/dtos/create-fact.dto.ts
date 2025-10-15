import { IsString } from 'class-validator';

export class CreateFactDto {
	@IsString()
	code: string;

	@IsString()
	description: string;
}
