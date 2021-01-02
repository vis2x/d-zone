export type IClientPayload = IJoin

export interface IJoin {
	name: 'JOIN'
	event: {
		guildId: string
	}
}
