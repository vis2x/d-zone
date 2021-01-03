import EventEmitter from 'eventemitter3'
import { IClientPayload } from 'root/typings/client-payload'
import {
	IServerPayload,
	IJoinSuccess,
	IJoinError,
} from 'root/typings/server-payload'
import { BrowserLogger } from '../utils/logger'

interface CommunicationEvents {
	internalJoinSuccess: [IJoinSuccess['event']]
	internalJoinError: [IJoinError['event']]
}

export class Communication extends EventEmitter<CommunicationEvents> {
	private websocket?: WebSocket
	private logger = new BrowserLogger('Communication')

	constructor() {
		super()
	}

	public init() {
		return new Promise<void>((resolve) => {
			const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
			const wsUrl = protocol + '//' + location.host

			this.websocket = new WebSocket(wsUrl)

			this.websocket.addEventListener('open', () => {
				this.logger.log('Connection opened')
				resolve()
			})

			this.websocket.addEventListener('message', ({ data }) => {
				const { name, event }: IServerPayload = JSON.parse(data)

				if (name === 'JOIN_SUCCESS')
					this.emit('internalJoinSuccess', event as IJoinSuccess['event'])
				else if (name === 'JOIN_ERROR')
					this.emit('internalJoinError', event as IJoinError['event'])
			})
		})
	}

	public join(guildId: string) {
		return new Promise<IJoinSuccess['event']>((resolve, reject) => {
			this.once('internalJoinSuccess', (event) => {
				this.removeListener('internalJoinError')
				resolve(event)
			})

			this.once('internalJoinError', (event) => {
				this.removeListener('internalJoinSuccess')
				reject(event)
			})

			this.send({ name: 'JOIN', event: { guildId } })
		})
	}

	private send(payload: IClientPayload) {
		if (!this.websocket) throw new Error('You forgot to connect websocket')
		this.websocket.send(JSON.stringify(payload))
	}
}
