export function startCountdown(seconds: number): Promise<void> {
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