import { Entity, Query, System } from 'ape-ecs'
import Hop from '../components/hop'
import Transform from '../components/transform'
import Sprite from '../components/sprite'
import Map from '../components/map'
import { HOP_OFFSETS, HOP_FRAMERATE } from '../../config/sprite'
import { Animations, Direction } from '../../typings'
import { getValidHop } from '../archetypes/actor'
import Map3D from '../../common/map-3d'
import { Tags } from '../'

export default class HopSystem extends System {
	private animations!: Animations
	private hopQuery!: Query
	private hopFrameCount!: number

	init(animations: Animations) {
		this.animations = animations
		this.hopFrameCount = this.animations['hop-east'].length
		this.hopQuery = this.createQuery()
			.fromAll(Hop, Transform, Sprite, Map)
			.persist()
	}

	update(/*tick: number*/) {
		// TODO: Hop system should not be handling animation, make an animation component & system
		this.hopQuery.execute().forEach((entity) => {
			const hop = entity.c[Hop.key] as Hop
			const map = entity.c[Map.key].map as Map3D<Entity>

			if (!hop.placeholder) {
				// Initialize new hop
				const actorGrid = map.getCellGrid(entity)
				if (!actorGrid) return console.error('Actor not found in map', entity)
				const validHop = getValidHop(actorGrid, hop, map)
				if (validHop) {
					hop.z = validHop.z
					entity.removeTag(Tags.Platform)
					hop.placeholder = this.world.createEntity({ tags: [Tags.Solid] })
					map.addCellToGrid(hop.placeholder, Map3D.addGrids(actorGrid, hop))
				} else {
					faceSpriteToHop(entity.c[Sprite.key] as Sprite, hop)
					entity.removeComponent(hop)
					return
				}
			}

			const sprite = entity.c[Sprite.key] as Sprite
			const frame = Math.floor(this.hopFrameCount * hop.progress)
			if (hop.progress >= 1) {
				// Hop completed
				const { x, y, z } = entity.c[Transform.key]
				const newGrid = {
					x: x + hop.x,
					y: y + hop.y,
					z: z + hop.z,
				}
				entity.c[Transform.key].update(newGrid)
				map.moveCellToGrid(entity, newGrid)
				if (hop.placeholder) {
					map.removeCellFromGrid(hop.placeholder, newGrid)
					hop.placeholder.destroy()
				}
				faceSpriteToHop(sprite, hop)
				entity.addTag(Tags.Platform)
				entity.removeComponent(hop)
			} else if (hop.progress === 0 || frame > hop.frame) {
				hop.frame = frame
				sprite.update({
					texture: this.animations[`hop-${hop.direction}`][hop.frame]
						.textureCacheIds[0],
				})
				if (hop.progress === 0) {
					sprite.update({
						zIndex: sprite.zIndex + 0.01,
					})
				}
				const zDepthOffset = getZDepthOffset(frame, hop.direction)
				if (zDepthOffset) {
					// Adjust z-depth while hopping
					sprite.update({
						zIndex: sprite.zIndex + zDepthOffset,
					})
				}
				if (hop.z !== 0) {
					// Raise or lower sprite while hopping up/down
					const yOffsets = hop.z > 0 ? HOP_OFFSETS.hopUpY : HOP_OFFSETS.hopDownY
					const yOffsetIndex = yOffsets.frames.indexOf(hop.frame)
					if (yOffsetIndex >= 0) {
						sprite.update({
							y: sprite.y + yOffsets.values[yOffsetIndex],
						})
					}
				}
			}
			hop.progress += 1 / this.hopFrameCount / HOP_FRAMERATE
		})
	}
}

function faceSpriteToHop(sprite: Sprite, hop: Hop) {
	sprite.update({
		texture: getCubeTexture(hop.direction),
	})
}

function getCubeTexture(direction: Direction): string {
	switch (direction) {
		case Direction.East:
			return 'cube:0'
		case Direction.South:
			return 'cube:1'
		case Direction.North:
		case Direction.West:
			return 'cube:2'
	}
}

function getZDepthOffset(frame: number, direction: Direction): number {
	const frameIndex = HOP_OFFSETS.hopZDepth.frames.indexOf(frame)
	if (frameIndex >= 0) {
		return HOP_OFFSETS.hopZDepth[direction][frameIndex]
	} else {
		return 0
	}
}