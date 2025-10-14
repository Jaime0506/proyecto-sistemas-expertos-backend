import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../entities/permission.entity';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
	@ApiProperty({
		description: 'ID del permiso a actualizar',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del permiso es requerido' })
	@IsNumber({}, { message: 'El ID del permiso debe ser un número' })
	id: number;

	@ApiProperty({
		description: 'Estado del permiso',
		example: 'Permite crear nuevos usuarios en el sistema',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El estado debe ser una cadena de texto' })
	status: StatusEnum;
}
