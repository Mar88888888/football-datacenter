import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FootballDataService {
  constructor(private readonly httpService: HttpService) {}

  async get(path: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.get(process.env.DATA_API + path).pipe(
        catchError((error: AxiosError) => {
          if (error.response?.status === 404) {
            throw new NotFoundException(`Resource not found at path: ${path}`);
          }
          throw error;
        }),
      ),
    );
    return data;
  }
}
