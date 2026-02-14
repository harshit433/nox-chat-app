/**
 * MCP routes - mounts MCP server at POST /mcp
 */

import { Router } from 'express';
import { statelessHandler } from 'express-mcp-handler';
import { createMcpServer } from './server.js';

const router = Router();

const serverFactory = () => createMcpServer();

router.post(
  '/',
  statelessHandler(serverFactory, {
    onError: (err) => console.error('[MCP] Error:', err),
  })
);

export default router;
