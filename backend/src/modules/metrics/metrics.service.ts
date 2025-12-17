import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly jobLastRunGauge: Gauge<string>;
  private readonly jobDuration: Histogram<string>;
  private readonly jobSuccess: Counter<string>;
  private readonly jobFailure: Counter<string>;
  private readonly cleanupCounter: Counter<string>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.jobLastRunGauge = new Gauge({
      name: 'job_last_run_timestamp_seconds',
      help: 'Last successful job run time (unix seconds)',
      labelNames: ['job'],
      registers: [this.registry],
    });

    this.jobDuration = new Histogram({
      name: 'job_duration_seconds',
      help: 'Job duration in seconds',
      labelNames: ['job'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.registry],
    });

    this.jobSuccess = new Counter({
      name: 'job_runs_total',
      help: 'Job runs by status',
      labelNames: ['job', 'status'],
      registers: [this.registry],
    });

    this.jobFailure = this.jobSuccess; // alias for readability

    this.cleanupCounter = new Counter({
      name: 'cleanup_items_total',
      help: 'Cleanup counts by type',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  getRegistry(): Registry {
    return this.registry;
  }

  markJobSuccess(job: string, durationMs: number) {
    this.jobSuccess.inc({ job, status: 'success' });
    this.jobLastRunGauge.set({ job }, Date.now() / 1000);
    this.jobDuration.observe({ job }, durationMs / 1000);
  }

  markJobFailure(job: string, durationMs: number) {
    this.jobFailure.inc({ job, status: 'failure' });
    this.jobDuration.observe({ job }, durationMs / 1000);
  }

  countCleanup(type: 'payments_expired' | 'bookings_expired' | 'seat_locks_released', count: number) {
    if (count > 0) {
      this.cleanupCounter.inc({ type }, count);
    }
  }
}
