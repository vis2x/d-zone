import React, { useEffect, useRef } from 'react'

import Game from '../../modules/game'
import { useComms } from '../../modules/communication'

export const GameComponent = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const { current: game } = useRef(new Game())
	const { serverMessage } = useComms()

	useEffect(() => {
		if (canvasRef.current) game.init(canvasRef.current).catch(console.error)
		return () => game.exit()
	}, [canvasRef])

	return (
		<div>
			<code>
				<pre>{JSON.stringify(serverMessage, null, 4)}</pre>
			</code>

			<canvas ref={canvasRef} />
		</div>
	)
}

export default GameComponent
