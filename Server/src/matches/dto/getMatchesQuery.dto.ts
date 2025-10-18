import { IsDateString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMatchesQueryDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Date must be a valid ISO 8601 date string (e.g., YYYY-MM-DD).',
    },
  )
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit cannot be more than 100.' })
  limit?: number;
}
