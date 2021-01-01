import React, { useEffect } from 'react'

import { useGame, GameStatus } from 'web/modules/game'
import { useComms } from 'web/modules/communication'

export const GameComponent = () => {
	const game = useGame()
	const comms = useComms()

	// Whenever game's status changes
	useEffect(() => {
		console.trace(
			`Status updated ${GameStatus[game.status]} - ${game.game.current?.uid}`
		)

		if (game.status === GameStatus.READY)
			comms.sendSeverPayload({
				name: 'SUBSCRIBE',
				event: { guildId: '700890186883530844' },
			})
	}, [game.status])

	// Whenever we a message from the server
	// TODO: Thin middleware should come here
	useEffect(() => {
		if (comms.serverMessage?.name === 'INIT')
			game.methods.addUsers(comms.serverMessage.event.users)
	}, [comms.serverMessage])

	// Development only
	const interact = (
		interaction: 'hopActor' | 'hopAllActors' | 'addActor' | 'removeActor'
	) => {
		if (game.status === GameStatus.READY && game.interactions)
			game.interactions[interaction]()
	}

	return (
		<div>
			<code>
				<pre>{JSON.stringify(comms.serverMessage, null, 4)}</pre>
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
