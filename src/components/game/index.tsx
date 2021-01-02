import React from 'react'
import { useDaisy } from 'root/src/modules/daisy'

export const GameComponent = () => {
	const { canvasRef } = useDaisy()

	// Development only
	const interact = (
		interaction: 'hopActor' | 'hopAllActors' | 'addActor' | 'removeActor'
	) => {
		console.log({ interaction })
	}

	return (
		<div>
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
