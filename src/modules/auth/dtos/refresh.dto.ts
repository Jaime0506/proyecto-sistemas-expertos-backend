import { IsString, IsOptional } from 'class-validator';

export class RefreshDto {
	// opcional si usas cookie; si quieres enviar por body
	@IsString()
	@IsOptional()
	refreshToken?: string;
}
