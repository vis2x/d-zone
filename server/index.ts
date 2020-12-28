import http, { createServer as createHTTPServer } from 'http'
import next from 'next'
import url from 'url'
import ws from 'ws'
import discord from 'eris'

import { parseConfig } from './utils/config'
import { handleError } from './utils/error'
import { manageClients } from './client-manager'

/** Main function. Everything starts here. */
async function main() {
	// Get the configuration
	const config = parseConfig({
		dev: process.env.NODE_ENV !== 'production',
		discord: { token: process.env.DISCORD_CLIENT_TOKEN },
		port: process.env.PORT || 3000,
	})

	// Create servers and discord client
	const NEXTRequestHandler = await createNEXTRequestHandler(config.dev)
	const httpServer = createHTTPServer(NEXTRequestHandler)
	const wsServer = new ws.Server({ server: httpServer })
	const discordClient = new discord.Client(config.discord.token)

	// Error handlers
	httpServer.on('error', handleError)
	wsServer.on('error', handleError)
	discordClient.on('error', handleError)

	// Start only once discord client is ready
	discordClient.on('ready', () => {
		console.log(`❄️ Connected as ${discordClient.user.username}`)
		httpServer.listen(config.port)
		console.log(`❄️ Listening on ${config.port}`)

		// Manages clients
		// While handling websocket and discord client communication
		manageClients(wsServer, discordClient)
	})

	// Start discord client
	// Once it is connected it starts server too
	await discordClient.connect()
}

/**
 * Creates next request handler for serving the HTTP API and files
 *
 * @param dev - Dev mode
 * @returns NEXT Request handler
 */
async function createNEXTRequestHandler(dev: boolean) {
	const NEXTApp = next({ dev: dev })
	const NEXTRequestHandler = NEXTApp.getRequestHandler()

	await NEXTApp.prepare()

	return (req: http.IncomingMessage, res: http.ServerResponse) => {
		const parsedUrl = url.parse(req.url as string, true)
		return NEXTRequestHandler(req, res, parsedUrl)
	}
}

main().catch(handleError)
process.on('uncaughtException', handleError)
