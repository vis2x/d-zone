import { useState, useEffect, useRef } from 'react'
import { IClientPayload } from 'root/typings/client-payload'
import { IServerPayload } from 'root/typings/server-payload'

/**
 * Communication hook
 *
 * @returns Hook
 */
export function useComms() {
	const [serverMessage, setServerMessage] = useState<IServerPayload>()
	const websocketRef = useRef<WebSocket>()

	// Create websocket and attach handlers only on first render
	useEffect(() => {
		const websocket = new WebSocket(`ws://${location.host}`)
		websocketRef.current = websocket

		// Helper functions
		const sendSeverPayload = (payload: IClientPayload) =>
			websocket.send(JSON.stringify(payload))

		websocket.addEventListener('open', () => {
			console.log('☎️ Connection Opened')

			// Hard coded for now
			// In future read url and change accordingly
			sendSeverPayload({
				name: 'SUBSCRIBE',
				event: { guildId: '700890186883530844' },
			})
		})

		websocket.addEventListener('close', () =>
			console.log('☎️ Connection closed')
		)

		websocket.addEventListener('message', ({ data }) => {
			const parsedData: IServerPayload = JSON.parse(data)
			setServerMessage(parsedData)
		})

		// Clean up function
		return () => websocket.close()
	}, [])

	return { serverMessage }
}
