export type IClientPayload = ISubscribe

export interface ISubscribe {
	name: 'SUBSCRIBE'
	event: {
		guildId: string
	}
}
