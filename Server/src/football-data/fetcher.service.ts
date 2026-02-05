import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

interface QueueItem<T> {
  key: string;
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

@Injectable()
export class FetcherService {
  private readonly logger = new Logger(FetcherService.name);
  private readonly inFlight = new Map<string, Promise<any>>();
  private readonly queue: QueueItem<any>[] = [];
  private isProcessing = false;
  private readonly maxWaitSeconds = 25;

  async fetch<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push({ key, task, resolve, reject });
    });

    this.inFlight.set(key, promise);
    this.processQueue();

    try {
      return await promise;
    } finally {
      this.inFlight.delete(key);
    }
  }

  isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const { key, task, resolve, reject } = item;

      try {
        const result = await this.executeWithRetry(key, task);
        resolve(result);
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 429 && status !== 404) {
          this.logger.error(`Failed: ${key} - ${error.message}`);
        }
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  private async executeWithRetry<T>(
    key: string,
    task: () => Promise<T>,
    attempt = 1,
  ): Promise<T> {
    try {
      return await task();
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.status === 429 &&
        attempt <= 3
      ) {
        const apiWaitTime = this.parseWaitTime(error) || attempt * 30;
        const waitSeconds = apiWaitTime + 5;

        if (waitSeconds > this.maxWaitSeconds) {
          throw error;
        }

        await this.sleep(waitSeconds * 1000);
        return this.executeWithRetry(key, task, attempt + 1);
      }
      throw error;
    }
  }

  private parseWaitTime(error: AxiosError): number | null {
    const message = (error.response?.data as any)?.message;
    const match = message?.match(/Wait (\d+) seconds/);
    return match ? parseInt(match[1], 10) : null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
