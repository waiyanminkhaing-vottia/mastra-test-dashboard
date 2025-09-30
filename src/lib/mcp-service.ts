import { MCPClient } from '@mastra/mcp';

import { logger } from '@/lib/logger';
import {
  MCP_SECURITY_CONFIG,
  validateMcpClientConfig,
  validateMcpUrl,
} from '@/lib/mcp-security';

const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

interface McpServerConfig {
  id: string;
  name: string;
  url: string;
}

interface McpTool {
  id: string;
  description?: string;
  name?: string;
  schema?: Record<string, unknown>;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  avgResponseTime: number;
  lastUpdated: number;
}

/**
 * Singleton service for managing MCP client connections and operations
 * Provides connection pooling, health monitoring, and centralized error handling
 */
export class McpService {
  private static instance: McpService;
  private clients = new Map<string, MCPClient>();
  private connectionHealth = new Map<
    string,
    {
      isHealthy: boolean;
      lastCheck: number;
      consecutiveFailures: number;
      responseTime: number;
    }
  >();
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    avgResponseTime: 0,
    lastUpdated: Date.now(),
  };
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly maxConsecutiveFailures = 3;
  private readonly healthCheckIntervalMs = 30000; // 30 seconds

  private constructor() {
    this.startHealthChecks();
    this.setupCleanupHandlers();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): McpService {
    if (!McpService.instance) {
      McpService.instance = new McpService();
    }
    return McpService.instance;
  }

  /**
   * Get or create MCP client with connection pooling
   */
  async getOrCreateClient(config: McpServerConfig): Promise<MCPClient> {
    const { id, name, url } = config;

    // Check if client already exists and is healthy
    const existingClient = this.clients.get(id);
    if (existingClient && this.isClientHealthy(id)) {
      logger.debug({
        msg: 'Reusing existing MCP client',
        mcpId: id,
        mcpName: name,
      });
      return existingClient;
    }

    // Validate URL
    const urlValidation = validateMcpUrl(url);
    if (!urlValidation.isValid) {
      throw new Error(`Invalid MCP URL: ${urlValidation.error}`);
    }

    // Check connection limits
    if (this.clients.size >= MCP_SECURITY_CONFIG.MAX_CONCURRENT_CONNECTIONS) {
      await this.cleanupUnhealthyConnections();

      if (this.clients.size >= MCP_SECURITY_CONFIG.MAX_CONCURRENT_CONNECTIONS) {
        throw new Error('Maximum concurrent MCP connections reached');
      }
    }

    // Create client configuration
    const clientConfig = {
      id: `${process.env.MCP_CLIENT_ID || 'mastra-dashboard'}-${id}`,
      timeout: MCP_SECURITY_CONFIG.REQUEST_TIMEOUT,
      maxRetries: 3,
    };

    const configValidation = validateMcpClientConfig(clientConfig);
    if (!configValidation.isValid) {
      throw new Error(
        `Invalid client config: ${configValidation.errors.join(', ')}`
      );
    }

    try {
      // Close existing unhealthy client if present
      if (existingClient) {
        await this.disconnect(id);
      }

      // Create new client
      const clientId = configValidation.sanitizedConfig.id;
      const timeout = configValidation.sanitizedConfig.timeout;
      const sanitizedUrl = urlValidation.sanitizedUrl;

      if (!clientId || !timeout || !sanitizedUrl) {
        throw new Error('Invalid configuration values after validation');
      }

      const client = new MCPClient({
        id: clientId,
        timeout: timeout,
        servers: {
          targetServer: {
            url: sanitizedUrl,
          },
        },
      });

      // Store client and initialize health status
      this.clients.set(id, client);
      this.connectionHealth.set(id, {
        isHealthy: true,
        lastCheck: Date.now(),
        consecutiveFailures: 0,
        responseTime: 0,
      });

      // Update metrics
      this.updateMetrics({
        totalConnections: this.metrics.totalConnections + 1,
        activeConnections: this.clients.size,
      });

      logger.info({
        msg: 'Created new MCP client',
        mcpId: id,
        mcpName: name,
        activeConnections: this.clients.size,
      });

      return client;
    } catch (error) {
      this.updateMetrics({
        failedConnections: this.metrics.failedConnections + 1,
      });

      logger.error({
        msg: 'Failed to create MCP client',
        mcpId: id,
        mcpName: name,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      });

      throw error;
    }
  }

  /**
   * Fetch tools from MCP server with error handling and metrics
   */
  async getTools(config: McpServerConfig): Promise<McpTool[]> {
    const startTime = Date.now();
    const { id, name } = config;

    try {
      const client = await this.getOrCreateClient(config);
      const tools = await client.getTools();
      const toolsArray = Object.values(tools) as McpTool[];
      const responseTime = Date.now() - startTime;

      // Update health status
      this.updateHealthStatus(id, true, responseTime);

      logger.debug({
        msg: 'Successfully fetched MCP tools via service',
        mcpId: id,
        mcpName: name,
        toolCount: toolsArray.length,
        responseTime,
      });

      return toolsArray;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateHealthStatus(id, false, responseTime);

      logger.error({
        msg: 'Failed to fetch MCP tools via service',
        mcpId: id,
        mcpName: name,
        responseTime,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      });

      throw error;
    }
  }

  /**
   * Disconnect specific MCP client
   */
  async disconnect(mcpId: string): Promise<void> {
    const client = this.clients.get(mcpId);
    if (!client) return;

    try {
      await client.disconnect();
      logger.debug({ msg: 'MCP client disconnected', mcpId });
    } catch (error) {
      logger.warn({
        msg: 'Error disconnecting MCP client',
        mcpId,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      });
    } finally {
      this.clients.delete(mcpId);
      this.connectionHealth.delete(mcpId);
      this.updateMetrics({
        activeConnections: this.clients.size,
      });
    }
  }

  /**
   * Disconnect all MCP clients
   */
  async disconnectAll(): Promise<void> {
    logger.info({
      msg: 'Disconnecting all MCP clients',
      count: this.clients.size,
    });

    const disconnectPromises = Array.from(this.clients.keys()).map(id =>
      this.disconnect(id).catch(error =>
        logger.error({
          msg: 'Error disconnecting client during cleanup',
          mcpId: id,
          error,
        })
      )
    );

    await Promise.allSettled(disconnectPromises);

    this.clients.clear();
    this.connectionHealth.clear();
    this.updateMetrics({
      activeConnections: 0,
    });
  }

  /**
   * Get connection health status
   */
  getHealthStatus(mcpId?: string) {
    if (mcpId) {
      return this.connectionHealth.get(mcpId);
    }
    return this.connectionHealth;
  }

  /**
   * Get service metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if client is healthy
   */
  private isClientHealthy(mcpId: string): boolean {
    const health = this.connectionHealth.get(mcpId);
    if (!health) return false;

    return (
      health.isHealthy &&
      health.consecutiveFailures < this.maxConsecutiveFailures &&
      Date.now() - health.lastCheck < this.healthCheckIntervalMs * 2
    );
  }

  /**
   * Update health status for a connection
   */
  private updateHealthStatus(
    mcpId: string,
    isHealthy: boolean,
    responseTime: number
  ): void {
    const current = this.connectionHealth.get(mcpId) || {
      isHealthy: true,
      lastCheck: 0,
      consecutiveFailures: 0,
      responseTime: 0,
    };

    this.connectionHealth.set(mcpId, {
      isHealthy,
      lastCheck: Date.now(),
      consecutiveFailures: isHealthy ? 0 : current.consecutiveFailures + 1,
      responseTime,
    });

    // Update average response time
    const totalResponseTime =
      this.metrics.avgResponseTime * this.metrics.totalConnections +
      responseTime;
    this.updateMetrics({
      avgResponseTime: totalResponseTime / (this.metrics.totalConnections + 1),
    });
  }

  /**
   * Update service metrics
   */
  private updateMetrics(updates: Partial<ConnectionMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...updates,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Clean up unhealthy connections
   */
  private async cleanupUnhealthyConnections(): Promise<void> {
    const unhealthyIds = Array.from(this.connectionHealth.entries())
      .filter(
        ([, health]) => !this.isClientHealthy(health.lastCheck.toString())
      )
      .map(([id]) => id);

    if (unhealthyIds.length > 0) {
      logger.info({
        msg: 'Cleaning up unhealthy MCP connections',
        count: unhealthyIds.length,
        ids: unhealthyIds,
      });

      await Promise.allSettled(unhealthyIds.map(id => this.disconnect(id)));
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.cleanupUnhealthyConnections();
      } catch (error) {
        logger.error({
          msg: 'Error during MCP health check cleanup',
          error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
        });
      }
    }, this.healthCheckIntervalMs);

    logger.debug({ msg: 'Started MCP health check interval' });
  }

  /**
   * Setup cleanup handlers for graceful shutdown
   */
  private setupCleanupHandlers(): void {
    if (typeof process !== 'undefined') {
      const cleanup = async () => {
        logger.info({ msg: 'Shutting down MCP service' });

        if (this.healthCheckInterval) {
          clearInterval(this.healthCheckInterval);
          this.healthCheckInterval = null;
        }

        await this.disconnectAll();
      };

      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
      process.on('beforeExit', cleanup);
    }
  }

  /**
   * Get list of active connection IDs
   */
  getActiveConnections(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Force reconnect for a specific MCP
   */
  async forceReconnect(mcpId: string): Promise<void> {
    logger.info({ msg: 'Forcing MCP reconnection', mcpId });
    await this.disconnect(mcpId);
    // Client will be recreated on next getOrCreateClient call
  }
}

/**
 * Export singleton instance
 */
export const mcpService = McpService.getInstance();
