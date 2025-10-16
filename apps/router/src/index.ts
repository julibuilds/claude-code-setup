/**
 * Router Service Entry Point
 *
 * This is the main entry point for the Claude Code Router Service.
 * It initializes the server and starts listening for requests.
 */

import { createServer } from "./server";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3456;
const HOST = process.env.HOST || "0.0.0.0";

console.log(`Starting Claude Code Router Service...`);
console.log(`Server will listen on ${HOST}:${PORT}`);

// TODO: Load configuration from file
// For now, we'll start with a minimal server setup
const app = createServer({} as any);

export default {
	port: PORT,
	hostname: HOST,
	fetch: app.fetch,
};
