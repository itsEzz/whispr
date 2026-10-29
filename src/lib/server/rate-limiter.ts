import { RATE_LIMITER_IP, RATE_LIMITER_IPUA } from '$app/env/private';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

export const rateLimiter = new RetryAfterRateLimiter({
	IP: RATE_LIMITER_IP,
	IPUA: RATE_LIMITER_IPUA
});
