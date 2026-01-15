declare module 'canvas-confetti' {
  export interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
    reset?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null>;

  export default confetti;
}
