import { UpdateRoleDto } from './update-role.dto';

export class UpdateRoleWithPermissionsDto extends UpdateRoleDto {
	permissions: number[];
}
