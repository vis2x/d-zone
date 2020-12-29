import Renderer from './renderer'
import Resources from './resources'
import Engine from './engine'
import Map3D from './common/map-3d'
import Interactions from './engine/interactions'
import { registerECS } from './engine/register-ecs'
import { seedGame } from './engine/seed-dev'
import type { Entity } from 'ape-ecs'
import type { IServerPayload } from 'root/typings/server-payload'

const TICKS_PER_SECOND = 60

export default class Game {
	renderer = new Renderer()
	resources = new Resources()
	map = new Map3D<Entity>()
	engine = new Engine()
	interactions = new Interactions()

	async init(canvas: HTMLCanvasElement) {
		// Initialize renderer with canvas
		this.renderer.init(canvas)
		console.log('Renderer created', this.renderer.app.stage)

		await this.resources.load()
		console.log('Resources loaded')

		// Register ECS components and systems
		registerECS(this.engine, this.renderer, this.resources)
		console.log('ECS world initialized!', this.engine.world)

		// Create placeholder activity
		seedGame(this.engine.world, this.map)

		// Initialize interactions manager
		this.interactions.init(this)

		// Start update loop
		this.engine.start(TICKS_PER_SECOND)
	}

	exit() {
		console.log('Shutting down game')
		this.renderer.stop()
		this.engine.stop()
	}

	sendMessage(msg: IServerPayload) {
		console.log(msg)
	}
}
