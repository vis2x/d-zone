import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import Cull from 'pixi-cull'

// Global PIXI settings
PIXI.settings.RESOLUTION = 1
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

export default class Renderer {
	app: PIXI.Application
	view: Viewport
	cull: any
	constructor(canvas: HTMLCanvasElement) {
		this.app = new PIXI.Application({
			backgroundColor: 0x1d171f,
			view: canvas,
		})
		this.view = new Viewport({
			screenWidth: this.app.view.offsetWidth,
			screenHeight: this.app.view.offsetHeight,
			interaction: this.app.renderer.plugins.interaction,
		})
		this.view.drag().pinch().wheel().decelerate()
		this.view.moveCenter(0, 0)
		this.view.sortableChildren = true
		this.app.stage.addChild(this.view)
		this.cull = new Cull.SpatialHash()
		this.cull.addContainer(this.view)
		this.app.ticker.add(() => {
			if (this.view.dirty) {
				this.cull.cull(this.view.getVisibleBounds())
				this.view.dirty = false
			}
		})
	}
}