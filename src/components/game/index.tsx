import React, { useEffect } from 'react'

import { useGame } from 'web/modules/game'
import { useComms } from 'web/modules/communication'

export const GameComponent = () => {
	const game = useGame()
	const { serverMessage, sendSeverPayload } = useComms()

	// Whenever game's status changes
	useEffect(() => {
		if (game.status === 'READY')
			sendSeverPayload({
				name: 'SUBSCRIBE',
				event: { guildId: '700890186883530844' },
			})

		if (game.status === 'ERROR') console.error(game.error)
	}, [game.status])

	// Whenever we a message from the server
	// TODO: Thin middleware should come here
	useEffect(() => {
		if (serverMessage?.name === 'INIT') game.addUsers(serverMessage.event.users)
	}, [serverMessage])

	// Development only
	const interact = (
		interaction: 'hopActor' | 'hopAllActors' | 'addActor' | 'removeActor'
	) => {
		if (game.status !== 'READY') return
		game.interactions[interaction]()
	}

	return (
		<div>
			<code>
				<pre>{JSON.stringify(serverMessage, null, 4)}</pre>
			</code>
			<div>
				<button onClick={() => interact('addActor')}>Add Actor</button>
				<button onClick={() => interact('removeActor')}>Remove Actor</button>
				<button onClick={() => interact('hopActor')}>Hop Actor</button>
				<button onClick={() => interact('hopAllActors')}>Hop All Actors</button>
			</div>
			<canvas ref={game.ref} />
		</div>
	)
}

export default GameComponent
