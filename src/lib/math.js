export const TAU = Math.PI * 2

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t

// Modulo that never goes negative: mod(-1, 5) === 4.
export const mod = (n, m) => ((n % m) + m) % m

// Wraps an angle into [-π, π).
export const wrapPi = (a) => mod(a + Math.PI, TAU) - Math.PI

// Cubic ease-in-out for t in [0, 1].
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
