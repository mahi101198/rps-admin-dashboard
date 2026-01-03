// Simple performance monitoring utility
class PerformanceMonitor {
  private metrics: Map<string, { start: number; end?: number }> = new Map();

  start(name: string): void {
    this.metrics.set(name, { start: performance.now() });
  }

  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' not found`);
      return null;
    }

    const end = performance.now();
    const duration = end - metric.start;
    this.metrics.set(name, { ...metric, end });
    
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  getDuration(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric || !metric.end) {
      return null;
    }
    return metric.end - metric.start;
  }

  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((metric, name) => {
      if (metric.end) {
        result[name] = metric.end - metric.start;
      }
    });
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();