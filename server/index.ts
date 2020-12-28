import http, { createServer as createHTTPServer } from 'http'
import next from 'next'
import url from 'url'
import discord from 'eris'

import { parseConfig } from './utils/config'
import { handleError } from './utils/error'
import { ClientManager } from './client-manager'
import { WebSocketServer } from './websocket-server'
import { IServerPayload } from 'typings/server-payload'
import { IClientPayload } from 'typings/client-payload'

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
	const wsServer = new WebSocketServer<IServerPayload, IClientPayload>(
		httpServer
	)
	const discordClient = new discord.Client(config.discord.token)

	// Client manager
	// Manages clients
	// While handling websocket and discord client communication
	const clientsManager = new ClientManager(wsServer, discordClient)

	// Error handlers
	httpServer.on('error', handleError)
	wsServer.on('error', handleError)
	discordClient.on('error', handleError)

	// Start only once discord client is ready
	discordClient.on('ready', () => {
		console.log(
			`❄️ Connected as ${discordClient.user.username} on ${discordClient.guilds.size} servers`
		)
		// If this is discord reconnecting, do not listen & init again
		if (!httpServer.listening) {
			httpServer.listen(config.port)
			console.log(`❄️ Listening on ${config.port}`)

			clientsManager.init()
		}
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
