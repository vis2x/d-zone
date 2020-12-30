import type { Entity } from 'ape-ecs'
import { useEffect, useRef, useState } from 'react'
import { IUser } from 'root/typings/resources'
import Map3D from './common/map-3d'
import Engine from './engine'
import Interactions from './engine/interactions'
import { registerECS } from './engine/register-ecs'
import Renderer from './renderer'
import Resources from './resources'

const TICKS_PER_SECOND = 60

class Game {
	private readonly renderer = new Renderer()
	private readonly resources = new Resources()
	private readonly map = new Map3D<Entity>()
	private readonly engine = new Engine()
	// TODO: Make this private in later versions
	interactions = new Interactions()

	public async init(canvas: HTMLCanvasElement) {
		// Initialize renderer with canvas
		this.renderer.init(canvas)
		console.log('Renderer created', this.renderer.app.stage)

		await this.resources.load()
		console.log('Resources loaded')

		// Register ECS components and systems
		registerECS(this.engine, this.renderer, this.resources)
		console.log('ECS world initialized!', this.engine.world)

		// Create placeholder activity
		// seedGame(this.engine.world, this.map)

		// Initialize interactions manager
		this.interactions.init(this.engine.world, this.map)
		console.log('Interactions initialized', this.interactions)

		// Start update loop
		this.engine.start(TICKS_PER_SECOND)
	}

	addUsers(users: IUser[]) {
		console.log('Creating actors from user list')
		users.forEach(() => this.interactions.addActor())
	}

	exit() {
		console.log('Shutting down game')
		this.renderer.stop()
		this.engine.stop()
	}
}

type GameHookState = 'IDLE' | 'LOADING' | 'READY' | 'ERROR'

/**
 * Game hook
 *
 * @returns Hook
 */
export function useGame() {
	const [error, setError] = useState<Error>()
	const [status, setStatus] = useState<GameHookState>('IDLE')

	const { current: game } = useRef(new Game())
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (canvas) {
			game
				.init(canvas)
				.then(() => setStatus('READY'))
				.catch((error) => {
					setError(error)
					setStatus('ERROR')
				})
		}

		return () => {
			game.exit()
			setStatus('IDLE')
		}
	}, [canvasRef])

	return {
		status,
		error,
		ref: canvasRef,

		addUsers: (users: IUser[]) => game.addUsers(users),

		interactions: game.interactions,
	}
}
