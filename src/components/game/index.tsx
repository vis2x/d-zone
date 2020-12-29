import React, { useEffect, useRef } from 'react'

import Game from '../../modules/game'
import { useComms } from 'web/modules/communication'

export const GameComponent = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const gameRef = useRef<Game | null>(null)
	const { serverMessage } = useComms()

	useEffect(() => {
		gameRef.current = new Game()
		const game = gameRef.current
		if (canvasRef.current) game.init(canvasRef.current).catch(console.error)
		return () => {
			if (game) game.exit()
		}
	}, [canvasRef])

	useEffect(() => {
		if (!gameRef.current || !serverMessage) return
		gameRef.current.sendMessage(serverMessage)
	}, [serverMessage])

	const interact = (
		interaction: 'hopActor' | 'hopAllActors' | 'addActor' | 'removeActor'
	) => {
		if (!gameRef.current) return
		gameRef.current.interactions[interaction]()
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
			<canvas ref={canvasRef} />
		</div>
	)
}

export default GameComponent
