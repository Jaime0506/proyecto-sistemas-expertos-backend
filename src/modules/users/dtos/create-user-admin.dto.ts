import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateUserAdminDto extends CreateUserDto {
	@ApiProperty({
		description: 'The role of the user',
		example: 1,
	})
	@IsNumber()
	@IsNotEmpty()
	role_id: number;
}
