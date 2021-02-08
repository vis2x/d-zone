import React from 'react'
import { useDaisy } from 'root/src/modules/daisy'
import { useWatch } from 'root/src/modules/utils/watch.hook'
import styled from 'styled-components'

const Canvas = styled.canvas`
	position: fixed;
	top: 0;
	left: 0;
	z-index: -1;
`

export const GameComponent = () => {
	const { canvasRef, gameRef } = useDaisy()
	const entities = useWatch(() => gameRef.current?.engine.world.entities.size)

	// Development only
	const interact = (
		interaction: 'hopActor' | 'hopAllActors' | 'addActor' | 'removeActor'
	) => {
		if (gameRef.current) gameRef.current.interactions[interaction]()
	}

	return (
		<div>
			<div>Number of entities - {entities.current}</div>

			<div>
				<button onClick={() => interact('addActor')}>Add Actor</button>
				<button onClick={() => interact('removeActor')}>Remove Actor</button>
				<button onClick={() => interact('hopActor')}>Hop Actor</button>
				<button onClick={() => interact('hopAllActors')}>Hop All Actors</button>
			</div>
			<Canvas ref={canvasRef} />
		</div>
	)
}

export default GameComponent
