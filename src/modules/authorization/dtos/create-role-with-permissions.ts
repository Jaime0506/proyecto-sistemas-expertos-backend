import { CreateRoleDto } from './create-role.dto';

export class CreateRoleWithPermissionsDto extends CreateRoleDto {
	permissions: number[];
}
