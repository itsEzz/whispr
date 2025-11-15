export interface HealthResponse {
	status: 'healthy' | 'unhealthy';
	timestamp: string;
	version?: string;
}
