export class Controller {
  readonly initial_duration: number;
  readonly min_duration: number;
  readonly max_duration: number;
  readonly step: number;
  readonly target_accuracy: number;
  readonly condition_specific: boolean;

  private readonly durations = new Map<string | null, number>();
  private readonly histories = new Map<string | null, boolean[]>();

  constructor(config: {
    initial_duration?: number;
    min_duration?: number;
    max_duration?: number;
    step?: number;
    target_accuracy?: number;
    condition_specific?: boolean;
  } = {}) {
    this.initial_duration = Number(config.initial_duration ?? 0.2);
    this.min_duration = Number(config.min_duration ?? 0.04);
    this.max_duration = Number(config.max_duration ?? 0.37);
    this.step = Number(config.step ?? 0.03);
    this.target_accuracy = Number(config.target_accuracy ?? 0.66);
    this.condition_specific = Boolean(config.condition_specific ?? true);
  }

  static from_dict(config: Record<string, unknown>): Controller {
    return new Controller({
      initial_duration: Number(config.initial_duration ?? 0.2),
      min_duration: Number(config.min_duration ?? 0.04),
      max_duration: Number(config.max_duration ?? 0.37),
      step: Number(config.step ?? 0.03),
      target_accuracy: Number(config.target_accuracy ?? 0.66),
      condition_specific: Boolean(config.condition_specific ?? true)
    });
  }

  private getKey(condition?: string | null): string | null {
    return this.condition_specific ? (condition ?? null) : null;
  }

  get_duration(condition?: string | null): number {
    const key = this.getKey(condition);
    if (!this.durations.has(key)) {
      this.durations.set(key, this.initial_duration);
      this.histories.set(key, []);
    }
    return this.durations.get(key) ?? this.initial_duration;
  }

  update(hit: boolean, condition?: string | null): void {
    const key = this.getKey(condition);
    const duration = this.get_duration(condition);
    const history = this.histories.get(key) ?? [];
    history.push(Boolean(hit));
    this.histories.set(key, history);

    const accuracy = history.reduce((sum, item) => sum + Number(item), 0) / history.length;
    const nextDuration =
      accuracy > this.target_accuracy
        ? Math.max(this.min_duration, duration - this.step)
        : Math.min(this.max_duration, duration + this.step);

    this.durations.set(key, nextDuration);
  }
}
