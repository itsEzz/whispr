import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

export const rateLimiter = new RetryAfterRateLimiter({
	IP: [30, 'm'],
	IPUA: [20, 'm']
});
