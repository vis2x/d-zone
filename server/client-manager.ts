import ws from 'ws'
import discord from 'eris'
import { IClientPayload } from '../typings/client-payload'
import { IServerPayload } from '../typings/server-payload'
import { AppError, handleError } from './utils/error'
import { handleSubscription } from './client-event-handlers'

/**
 * Manage clients
 *
 * @param wsServer - Websocket server
 * @param discordClient - Discord client
 */
export function manageClients(
	wsServer: ws.Server,
	discordClient: discord.Client
) {
	const wsClientDiscordGuildIdMap = new Map<ws, string>()

	wsServer.on('connection', (client) => {
		console.log(`😺 New websocket connection - ${new Date()}`)

		client.on('message', (data) =>
			wsClientMessageListenenr({
				data,
				discordClient,
				wsClient: client,
				wsClientDiscordGuildIdMap,
			}).catch(handleError)
		)

		client.on('close', () => {
			console.log(`😺 Connection closed - ${new Date()}`)
			wsClientDiscordGuildIdMap.delete(client)
		})
	})

	discordClient.on('messageCreate', (message) => {
		for (const [client, guildId] of wsClientDiscordGuildIdMap) {
			if (message.guildID === guildId) {
				sendWSMessage(
					{
						name: 'MESSAGE',
						event: {
							message: message.content,
							user: {
								id: message.author.id,
								username: message.author.username,
							},
						},
					},
					client
				).catch(handleError)
			}
		}
	})
}

/**
 * Websocket client message listener
 *
 * @param __namedParamaters - Websocket client message listener
 * @param __namedParamaters.data - Websocket listener data
 * @param __namedParamaters.wsClient - Websocket client
 * @param __namedParamaters.wsClientDiscordGuildIdMap - Client and server
 *     relation map
 */
async function wsClientMessageListenenr({
	data,
	discordClient,
	wsClient,
	wsClientDiscordGuildIdMap,
}: {
	data: ws.Data
	discordClient: discord.Client
	wsClient: ws
	wsClientDiscordGuildIdMap: Map<ws, string>
}) {
	const { name, event }: IClientPayload = JSON.parse(data.toString())

	switch (name) {
		case 'SUBSCRIBE': {
			handleSubscription({
				discordClient,
				event,
				wsClient,
				wsClientDiscordGuildIdMap,
			}).catch(handleError)
			break
		}

		default:
			// Report error here
			break
	}
}

/**
 * Send message to client
 *
 * @param message - Server payload
 * @param client - Client message to be sent to
 * @returns Promise
 */
export function sendWSMessage(message: IServerPayload, client: ws) {
	return new Promise<void>((resolve, reject) =>
		ws.OPEN
			? client.send(JSON.stringify(message), (error) =>
					error ? reject(error) : resolve()
			  )
			: reject(
					new AppError(
						'WS_CLIENT_NOT_OPEN',
						'Cannot send message when client is not open',
						true
					)
			  )
	)
}
