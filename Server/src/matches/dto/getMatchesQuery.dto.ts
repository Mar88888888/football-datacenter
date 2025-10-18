import { IsDateString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMatchesQueryDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Date must be a valid ISO date string (e.g. YYYY-MM-DD).',
    },
  )
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(1000, { message: 'Limit cannot be more than 1000.' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer.' })
  @Min(1, { message: 'Offset must be at least 1.' })
  @Max(1000, { message: 'Offset cannot be more than 1000.' })
  offset?: number;
}
