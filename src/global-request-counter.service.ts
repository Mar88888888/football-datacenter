import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GlobalRequestCounterService {
  private readonly logger = new Logger(GlobalRequestCounterService.name);
  private requestCounter = 0;
  private countdownInProgress = false;
  private lastIncrementTime: number | null = null;

  async incrementCounter(): Promise<void> {
    const currentTime = Date.now();
    if (this.lastIncrementTime && (currentTime - this.lastIncrementTime) > 60000) {
      this.requestCounter = 0;
    }

    this.requestCounter++;
    this.lastIncrementTime = currentTime;

    if (this.requestCounter >= 9 && !this.countdownInProgress) {
      this.logger.log("Rate limit reached, waiting for 60 seconds...");
      this.countdownInProgress = true;
      await this.startCountdown(60);
      this.requestCounter = 0; 
      this.countdownInProgress = false;
    }
  }

  private startCountdown(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      let remainingSeconds = seconds;
      const intervalId = setInterval(() => {
        process.stdout.write(`\rWaiting: ${remainingSeconds}s`);
        remainingSeconds--;

        if (remainingSeconds < 0) {
          clearInterval(intervalId);
          process.stdout.write('\n');
          resolve();
        }
      }, 1000);
    });
  }
}
