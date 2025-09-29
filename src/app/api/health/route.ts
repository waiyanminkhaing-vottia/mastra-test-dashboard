import { createSuccessResponse, withApiProtection } from '@/lib/api-utils';
import { rateLimiters } from '@/lib/rate-limit';

/**
 * GET /api/health
 * Health check endpoint with system metrics and status information
 * Includes database connectivity, memory usage, and service status
 * @returns JSON response with detailed health information
 */
export const GET = withApiProtection(rateLimiters.readonly, async () => {
  const startTime = Date.now();

  // Basic system information
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mastra-test-dashboard',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used:
        Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total:
        Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      external:
        Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
    },
    checks: {
      system: checkSystemHealth(),
    },
    responseTime: Date.now() - startTime,
  };

  // Determine overall status based on checks
  const allChecksHealthy = Object.values(healthData.checks).every(
    check => check.status === 'healthy'
  );

  if (!allChecksHealthy) {
    healthData.status = 'degraded';
  }

  return createSuccessResponse(healthData);
});

/**
 * Check database connectivity
 * @returns Health check result for database
 */
async function checkDatabaseConnection(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  responseTime?: number;
}> {
  try {
    const startTime = Date.now();

    // Try to import prisma dynamically to avoid issues if not available
    const { prisma } = await import('@/lib/prisma');

    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime,
    };
  } catch {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
    };
  }
}

/**
 * Check basic system health metrics
 * @returns Health check result for system
 */
function checkSystemHealth(): {
  status: 'healthy' | 'unhealthy';
  message: string;
  metrics: {
    memoryUsagePercent: number;
    uptimeHours: number;
  };
} {
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = Math.round(
    (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  );
  const uptimeHours = Math.round((process.uptime() / 3600) * 100) / 100;

  // Consider system unhealthy if memory usage is very high
  const isHealthy = memoryUsagePercent < 90;

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy
      ? 'System metrics within normal range'
      : 'High memory usage detected',
    metrics: {
      memoryUsagePercent,
      uptimeHours,
    },
  };
}
