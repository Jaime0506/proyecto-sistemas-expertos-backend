import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@ApiProperty({
		description: 'The id of the user',
		example: 1,
	})
	@IsNumber()
	@IsNotEmpty()
	id: number;
}
