import { useEffect, useRef, useState } from 'react'
import { IUser } from 'root/typings/resources'

import Map3D from './common/map-3d'
import type { Entity } from 'ape-ecs'

import Engine from './engine'
import Interactions from './engine/interactions'
import { registerECS } from './engine/register-ecs'
import Renderer from './renderer'
import Resources from './resources'

const TICKS_PER_SECOND = 60

export enum GameStatus {
	NOT_INIT,
	LOADING,
	READY,
	SHUTTING_DOWN,
	SHUT_DOWN,
	ERROR,
}

interface Game {
	uid: number
	map: Map3D<Entity>
	engine: Engine
	interactions: Interactions
	renderer: Renderer
	resources: Resources
}

/**
 * Game hook
 *
 * @returns Hook
 */
export function useGame() {
	const [status, setStatus] = useState<GameStatus>(GameStatus.NOT_INIT)

	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const gameRef = useRef<Game | null>(null)

	useEffect(() => {
		const asyncWrapper = async () => {
			setStatus(GameStatus.LOADING)

			if (canvasRef.current === null) {
				setStatus(GameStatus.NOT_INIT)
				return console.log('Skipping effect because canvas not found')
			}

			const map = new Map3D<Entity>()
			const engine = new Engine()
			const interactions = new Interactions()
			const renderer = new Renderer()
			const resources = new Resources()

			const game: Game = {
				uid: Math.floor(Math.random() * 1000),
				map,
				engine,
				interactions,
				renderer,
				resources,
			}

			console.log('Prepared game components', { game })

			renderer.init(canvasRef.current)
			console.log('Initialised renderer')

			await resources.load()
			console.log('Resources loaded')

			interactions.init(engine.world, map)
			console.log('Interactions initialised')

			registerECS(engine, renderer, resources)
			console.log('Registered ECS')

			engine.start(TICKS_PER_SECOND)
			console.log(`Started engine at ${TICKS_PER_SECOND}`)

			gameRef.current = game

			setStatus(GameStatus.READY)
		}

		asyncWrapper().catch((error) => {
			console.error(error)
			setStatus(GameStatus.ERROR)
		})

		// Clean up function run on unmount of the component
		return function cleanup() {
			setStatus(GameStatus.SHUTTING_DOWN)
			const game = gameRef.current

			if (game !== null) {
				game.renderer.stop()
				game.engine.stop()
				gameRef.current = null
			}

			setStatus(GameStatus.SHUT_DOWN)
			console.log('Game shut down')
		}
	}, [])

	return {
		ref: canvasRef,
		status,

		interactions: gameRef.current?.interactions,
		game: gameRef,

		methods: {
			addUsers: (users: IUser[]) => {
				const game = gameRef.current

				if (game === null) {
					console.error(new Error('Game has not been initialised'))
					setStatus(GameStatus.ERROR)
				} else users.forEach(() => game.interactions.addActor())
			},
		},
	}
}
