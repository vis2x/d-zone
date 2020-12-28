import discord from 'eris'
import ws from 'ws'
import { sendWSMessage } from './client-manager'
import { ISubscribe } from '../typings/client-payload'
import { ServerError } from '../typings/server-payload'

/**
 * Handles subscription of a client to a servers messages
 *
 * @param __namedParamaters - Options
 * @param __namedParamaters.discordClient - Discord client
 * @param __namedParamaters.event - Subscription event
 * @param __namedParamaters.wsClient - Websocket client
 * @param __namedParamaters.wsClientDiscordGuildIdMap - Client and discord guild map
 */
export async function handleSubscription({
	discordClient,
	event,
	wsClient,
	wsClientDiscordGuildIdMap,
}: {
	discordClient: discord.Client
	event: ISubscribe['event']
	wsClient: ws
	wsClientDiscordGuildIdMap: Map<ws, string>
}) {
	const guild = discordClient.guilds.find(({ id }) => id === event.guildId)

	if (guild === undefined)
		await sendWSMessage(
			{
				name: 'ERROR',
				event: { error: ServerError.SERVER_NOT_FOUND },
			},
			wsClient
		)
	else {
		wsClientDiscordGuildIdMap.set(wsClient, guild.id)
		await sendWSMessage(
			{
				name: 'INIT',
				event: {
					server: { id: guild.id },
					users: guild.members.map(({ id, username }) => ({
						id,
						username,
					})),
				},
			},
			wsClient
		)

		console.log(`😸 Client is listening to ${guild.id} server`)
	}
}
