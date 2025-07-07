// Temporary stub for RealTimeService
// Full implementation will be done in IMPL-002: SystemControl Settings

export class RealTimeService {
  private static instance: RealTimeService;
  
  static getInstance(): RealTimeService {
    if (!this.instance) {
      this.instance = new RealTimeService();
    }
    return this.instance;
  }

  start(): void {
    console.log('RealTimeService: start() - stub implementation');
  }

  stop(): void {
    console.log('RealTimeService: stop() - stub implementation');
  }

  subscribe(key: string, _callback: (data: any) => void): () => void {
    console.log(`RealTimeService: subscribe(${key}) - stub implementation`);
    return () => {
      console.log(`RealTimeService: unsubscribe(${key}) - stub implementation`);
    };
  }
}
