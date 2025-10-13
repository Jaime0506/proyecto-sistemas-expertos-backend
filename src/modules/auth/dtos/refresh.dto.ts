import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RefreshDto {
	@ApiProperty({
		description: 'The refresh token (optional if using cookies)',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		required: false,
	})
	@IsString()
	@IsOptional()
	refreshToken?: string;
}
