import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
	@ApiProperty({
		description: 'ID del permiso a actualizar',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del permiso es requerido' })
	@IsNumber({}, { message: 'El ID del permiso debe ser un número' })
	id: number;
}
