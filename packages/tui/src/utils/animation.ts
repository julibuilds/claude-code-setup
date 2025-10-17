// ============================================================================
// Animation Utilities
// ============================================================================

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Common easing functions
 * All functions take a value between 0-1 and return a value between 0-1
 */
export const easingFunctions = {
	linear: (t: number): number => t,

	// Quad
	easeInQuad: (t: number): number => t * t,
	easeOutQuad: (t: number): number => t * (2 - t),
	easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

	// Cubic
	easeInCubic: (t: number): number => t * t * t,
	easeOutCubic: (t: number): number => --t * t * t + 1,
	easeInOutCubic: (t: number): number =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

	// Quart
	easeInQuart: (t: number): number => t * t * t * t,
	easeOutQuart: (t: number): number => 1 - --t * t * t * t,
	easeInOutQuart: (t: number): number => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

	// Quint
	easeInQuint: (t: number): number => t * t * t * t * t,
	easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
	easeInOutQuint: (t: number): number =>
		t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

	// Expo
	easeInExpo: (t: number): number => (t === 0 ? 0 : 2 ** (10 * (t - 1))),
	easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
	easeInOutExpo: (t: number): number => {
		if (t === 0 || t === 1) return t;
		if (t < 0.5) return 2 ** (20 * t - 10) / 2;
		return (2 - 2 ** (-20 * t + 10)) / 2;
	},

	// Circ
	easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
	easeOutCirc: (t: number): number => Math.sqrt(1 - --t * t),
	easeInOutCirc: (t: number): number =>
		t < 0.5
			? (1 - Math.sqrt(1 - 4 * t * t)) / 2
			: (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,

	// Back
	easeInBack: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return c3 * t * t * t - c1 * t * t;
	},
	easeOutBack: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
	},
	easeInOutBack: (t: number): number => {
		const c1 = 1.70158;
		const c2 = c1 * 1.525;
		return t < 0.5
			? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
			: ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
	},

	// Elastic
	easeInElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0 ? 0 : t === 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4);
	},
	easeOutElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},
	easeInOutElastic: (t: number): number => {
		const c5 = (2 * Math.PI) / 4.5;
		return t === 0
			? 0
			: t === 1
				? 1
				: t < 0.5
					? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
					: (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
	},

	// Bounce
	easeInBounce: (t: number): number => 1 - easingFunctions.easeOutBounce(1 - t),
	easeOutBounce: (t: number): number => {
		const n1 = 7.5625;
		const d1 = 2.75;
		if (t < 1 / d1) {
			return n1 * t * t;
		} else if (t < 2 / d1) {
			return n1 * (t -= 1.5 / d1) * t + 0.75;
		} else if (t < 2.5 / d1) {
			return n1 * (t -= 2.25 / d1) * t + 0.9375;
		} else {
			return n1 * (t -= 2.625 / d1) * t + 0.984375;
		}
	},
	easeInOutBounce: (t: number): number =>
		t < 0.5
			? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2
			: (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2,
};

/**
 * Get easing function by name
 */
export function getEasingFunction(name: string = "linear"): EasingFunction {
	return easingFunctions[name as keyof typeof easingFunctions] || easingFunctions.linear;
}

/**
 * Animation options
 */
export interface AnimationOptions {
	duration: number;
	ease?: EasingFunction | string;
	onUpdate?: (value: number) => void;
	onComplete?: () => void;
	delay?: number;
}

/**
 * Animation state
 */
interface AnimationState {
	startTime: number;
	startValue: number;
	endValue: number;
	duration: number;
	easing: EasingFunction;
	onUpdate?: (value: number) => void;
	onComplete?: () => void;
	isComplete: boolean;
}

/**
 * Animation class
 */
export class Animation {
	private state: AnimationState;
	private rafId: number | null = null;

	constructor(from: number, to: number, options: AnimationOptions) {
		const easing =
			typeof options.ease === "string"
				? getEasingFunction(options.ease)
				: options.ease || easingFunctions.linear;

		this.state = {
			startTime: Date.now() + (options.delay || 0),
			startValue: from,
			endValue: to,
			duration: options.duration,
			easing,
			onUpdate: options.onUpdate,
			onComplete: options.onComplete,
			isComplete: false,
		};
	}

	start(): this {
		this.tick();
		return this;
	}

	stop(): void {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	private tick = (): void => {
		const now = Date.now();
		const elapsed = now - this.state.startTime;

		if (elapsed < 0) {
			// Animation hasn't started yet (delay)
			this.rafId = requestAnimationFrame(this.tick);
			return;
		}

		if (elapsed >= this.state.duration) {
			// Animation complete
			this.state.isComplete = true;
			this.state.onUpdate?.(this.state.endValue);
			this.state.onComplete?.();
			return;
		}

		// Calculate progress
		const progress = elapsed / this.state.duration;
		const easedProgress = this.state.easing(progress);
		const currentValue =
			this.state.startValue + (this.state.endValue - this.state.startValue) * easedProgress;

		this.state.onUpdate?.(currentValue);
		this.rafId = requestAnimationFrame(this.tick);
	};

	isRunning(): boolean {
		return !this.state.isComplete && this.rafId !== null;
	}
}

/**
 * Create a simple animation
 */
export function createAnimation(from: number, to: number, options: AnimationOptions): Animation {
	return new Animation(from, to, options);
}

/**
 * Timeline step
 */
interface TimelineStep {
	animation: Animation;
	delay: number;
}

/**
 * Animation timeline for sequencing multiple animations
 */
export class Timeline {
	private steps: TimelineStep[] = [];
	private currentStep = 0;
	private isRunning = false;

	add(animation: Animation, delay: number = 0): this {
		this.steps.push({ animation, delay });
		return this;
	}

	start(): this {
		if (this.isRunning || this.steps.length === 0) return this;
		this.isRunning = true;
		this.currentStep = 0;
		this.playNextStep();
		return this;
	}

	stop(): void {
		this.isRunning = false;
		if (this.currentStep < this.steps.length) {
			this.steps[this.currentStep]?.animation.stop();
		}
	}

	private playNextStep(): void {
		if (!this.isRunning || this.currentStep >= this.steps.length) {
			this.isRunning = false;
			return;
		}

		const step = this.steps[this.currentStep];
		if (!step) return;

		if (step.delay > 0) {
			setTimeout(() => {
				if (!this.isRunning) return;
				this.playAnimation(step.animation);
			}, step.delay);
		} else {
			this.playAnimation(step.animation);
		}
	}

	private playAnimation(animation: Animation): void {
		const originalOnComplete = animation["state"].onComplete;
		animation["state"].onComplete = () => {
			originalOnComplete?.();
			this.currentStep++;
			this.playNextStep();
		};
		animation.start();
	}

	reset(): this {
		this.stop();
		this.currentStep = 0;
		return this;
	}
}

/**
 * Create a timeline
 */
export function createTimeline(): Timeline {
	return new Timeline();
}

/**
 * Interpolate between two values
 */
export function interpolate(from: number, to: number, progress: number): number {
	return from + (to - from) * progress;
}

/**
 * Interpolate between two colors (hex format)
 */
export function interpolateColor(from: string, to: string, progress: number): string {
	const fromRgb = hexToRgb(from);
	const toRgb = hexToRgb(to);

	if (!fromRgb || !toRgb) return from;

	const r = Math.round(interpolate(fromRgb.r, toRgb.r, progress));
	const g = Math.round(interpolate(fromRgb.g, toRgb.g, progress));
	const b = Math.round(interpolate(fromRgb.b, toRgb.b, progress));

	return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1] ?? "0", 16),
				g: parseInt(result[2] ?? "0", 16),
				b: parseInt(result[3] ?? "0", 16),
			}
		: null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
	return (
		"#" +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? "0" + hex : hex;
			})
			.join("")
	);
}

/**
 * Animate an object property
 */
export function animateProperty<T extends object>(
	target: T,
	property: keyof T,
	from: number,
	to: number,
	options: AnimationOptions
): Animation {
	return createAnimation(from, to, {
		...options,
		onUpdate: (value) => {
			(target[property] as any) = value;
			options.onUpdate?.(value);
		},
	}).start();
}

/**
 * Spring animation options
 */
export interface SpringOptions {
	stiffness?: number; // Default: 100
	damping?: number; // Default: 10
	mass?: number; // Default: 1
	initialVelocity?: number; // Default: 0
	onUpdate?: (value: number) => void;
	onComplete?: () => void;
	restThreshold?: number; // Default: 0.01
}

/**
 * Spring animation using physics simulation
 */
export class SpringAnimation {
	private value: number;
	private velocity: number;
	private target: number;
	private stiffness: number;
	private damping: number;
	private mass: number;
	private restThreshold: number;
	private onUpdate?: (value: number) => void;
	private onComplete?: () => void;
	private rafId: number | null = null;
	private isComplete = false;

	constructor(from: number, to: number, options: SpringOptions = {}) {
		this.value = from;
		this.target = to;
		this.velocity = options.initialVelocity || 0;
		this.stiffness = options.stiffness || 100;
		this.damping = options.damping || 10;
		this.mass = options.mass || 1;
		this.restThreshold = options.restThreshold || 0.01;
		this.onUpdate = options.onUpdate;
		this.onComplete = options.onComplete;
	}

	start(): this {
		this.tick();
		return this;
	}

	stop(): void {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	private tick = (): void => {
		const deltaTime = 1 / 60; // Assume 60fps

		// Spring force: F = -k * x
		const springForce = -this.stiffness * (this.value - this.target);

		// Damping force: F = -c * v
		const dampingForce = -this.damping * this.velocity;

		// Total force
		const force = springForce + dampingForce;

		// Acceleration: a = F / m
		const acceleration = force / this.mass;

		// Update velocity: v = v + a * dt
		this.velocity += acceleration * deltaTime;

		// Update position: x = x + v * dt
		this.value += this.velocity * deltaTime;

		// Check if at rest
		const displacement = Math.abs(this.value - this.target);
		const velocityMagnitude = Math.abs(this.velocity);

		if (displacement < this.restThreshold && velocityMagnitude < this.restThreshold) {
			this.value = this.target;
			this.velocity = 0;
			this.isComplete = true;
			this.onUpdate?.(this.value);
			this.onComplete?.();
			return;
		}

		this.onUpdate?.(this.value);
		this.rafId = requestAnimationFrame(this.tick);
	};

	isRunning(): boolean {
		return !this.isComplete && this.rafId !== null;
	}
}

/**
 * Create a spring animation
 */
export function createSpring(
	from: number,
	to: number,
	options: SpringOptions = {}
): SpringAnimation {
	return new SpringAnimation(from, to, options);
}
