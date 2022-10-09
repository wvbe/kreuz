import * as THREE from 'three';
import { Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Coordinate } from '../classes/Coordinate.ts';
import { Event } from '../classes/Event.ts';
import { MATERIAL_LINES, MATERIAL_TERRAIN } from '../constants/materials.ts';
import { activePalette } from '../constants/palettes.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import { SettlementEntity } from '../entities/SettlementEntity.ts';
import Game from '../Game.ts';
import { Terrain } from '../terrain/Terrain.ts';
import { ControllerI, CoordinateI, EntityI, EntityPersonI, TileI, ViewI } from '../types.ts';
import { Controller } from './Controller.ts';
import { convertCoordinate } from './utils.ts';

type ThreeControllerOptions = {
	/**
	 * Set to `Infinity` for isometric view, or a value between 45 and 70 for a normal-ish camera
	 */
	fieldOfView: number;
	pixelRatio: number;
	enableAutoRotate: boolean;
	enablePan: boolean;
	enableZoom: boolean;
	restrictCameraAngle: boolean;
};

// This global mapping helps reduce the amount of new WebGLRenderer that need to be created. If
// created too many, the oldest renderer will be cleaned up at some point -- which is probably the
// main renderer, and the screen goes blank.
const RENDERER_BY_ELEMENT = new WeakMap<HTMLElement, THREE.WebGLRenderer | null>();

export class ThreeController extends Controller implements ViewI, ControllerI {
	public scene: THREE.Scene;
	public renderer: THREE.WebGLRenderer;
	public camera: THREE.Camera;
	public controls: OrbitControls;
	public raycaster: THREE.Raycaster;
	public clock: THREE.Clock;

	/**
	 * The element into which the ThreeJS canvas as well as any overlay elements are placed
	 */
	public root: HTMLElement;

	/**
	 * The controller starts controlling the Three canvas. The opposite of $detach.
	 * @deprecated
	 */
	public readonly $start = new Event('ThreeController#start');

	/**
	 * The controller stops controlling the canvas, animation stops. The opposite of $start.
	 */
	public readonly $detach = new Event('ThreeController#$detach');

	public readonly $destruct = new Event('ThreeController#$destruct');

	/**
	 * The event that a render happens, and the canvas/game state needs an update.
	 *
	 * This event fires probably 60 times per second while the controller is started.
	 */
	public readonly $update = new Event();

	/**
	 * The event that the viewport is resized
	 */
	public readonly $resize = new Event();

	/**
	 * The event that an entity mesh is clicked
	 */
	public readonly $clickEntity = new Event<[MouseEvent, EntityPersonI]>(
		'ThreeController#$clickEntity',
	);

	/**
	 * The event that a tile mesh is clicked
	 */
	public readonly $clickTile = new Event<[MouseEvent, TileI]>('ThreeController#$clickTile');

	/**
	 * The event that the ThreeJS canvas was clicked, but it was not on an entity or tile.
	 */
	public readonly $click = new Event<[MouseEvent]>('ThreeController#$click');

	/**
	 * The event that the camera moves, or as ThreeJS puts it:
	 *   "Fires when the camera has been transformed by the controls.""
	 */
	public readonly $camera = new Event();

	public constructor(root: HTMLElement, options: ThreeControllerOptions) {
		this.$destruct.once(() => {
			if (this.$$animating.get()) {
				this.stopAnimationLoop();
			}
			this.detachFromGame();
		});
		// @TODO remove these event listeners from the place where they are set.
		this.$detach.once(() => {
			this.$camera.clear();
			// this.$resize.clear();
			this.$click.clear();
			this.$clickEntity.clear();
			this.$clickTile.clear();
		});

		this.root = root;

		this.clock = new THREE.Clock();

		// https://threejs.org/docs/#api/en/scenes/Scene
		this.scene = new THREE.Scene();

		// https://threejs.org/docs/#api/en/renderers/WebGLRenderer
		this.renderer =
			RENDERER_BY_ELEMENT.get(root) ||
			new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
			});
		RENDERER_BY_ELEMENT.set(root, this.renderer);
		this.$destruct.once(() => this.renderer.dispose.bind(this.renderer));

		// Set the camera;
		//   https://threejs.org/docs/#api/en/cameras/OrthographicCamera
		//   https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
		const { aspect } = this.getViewportSize();
		if (options.fieldOfView === Infinity) {
			const frustumSize = 7;
			this.camera = new THREE.OrthographicCamera(
				-frustumSize * aspect,
				frustumSize * aspect,
				frustumSize,
				-frustumSize,
				1,
				1000,
			);
			this.$destruct.once(
				this.$resize.on(() => {
					const { aspect, width, height } = this.getViewportSize();
					const camera = this.camera as THREE.OrthographicCamera;
					camera.left = (-frustumSize * aspect) / 2;
					camera.right = (frustumSize * aspect) / 2;
					camera.top = frustumSize / 2;
					camera.bottom = -frustumSize / 2;
					camera.updateProjectionMatrix();
					this.renderer.setSize(width * options.pixelRatio, height * options.pixelRatio, false);
				}),
			);
		} else {
			this.camera = new THREE.PerspectiveCamera(options.fieldOfView, aspect, 0.1, 1000);
			this.$destruct.once(
				this.$resize.on(() => {
					const { aspect, width, height } = this.getViewportSize();
					const camera = this.camera as THREE.PerspectiveCamera;
					camera.aspect = aspect;
					camera.updateProjectionMatrix();
					this.renderer.setSize(width * options.pixelRatio, height * options.pixelRatio, false);
				}),
			);
		}
		this.$resize.emit();
		this.renderer.domElement.style.width = '100%';
		this.renderer.domElement.style.height = '100%';

		// https://threejs.org/docs/#examples/en/controls/OrbitControls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		if (options.restrictCameraAngle) {
			this.controls.maxPolarAngle = 0.45 * Math.PI;
		}
		this.controls.screenSpacePanning = false;
		this.controls.enableZoom = options.enableZoom;
		this.controls.enableDamping = true;
		this.controls.enablePan = options.enablePan;
		this.controls.dampingFactor = 0.1;
		this.controls.autoRotate = options.enableAutoRotate;
		this.$destruct.once(this.controls.dispose.bind(this.controls));

		// https://threejs.org/docs/#api/en/core/Raycaster
		// @TODO maybe can be global?
		this.raycaster = new THREE.Raycaster();

		const light = new THREE.AmbientLight(0xffffff, 0.3);
		this.scene.add(light);

		const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
		light2.position.set(1, 1, 1).normalize();
		this.scene.add(light2);
		// this.scene.add(new THREE.DirectionalLightHelper(light2, 1));

		const light3 = new THREE.DirectionalLight(0xffffff, 0.5);
		light3.position.set(-1, 1, -1).normalize();
		this.scene.add(light3);
		// this.scene.add(new THREE.DirectionalLightHelper(light3, 1));

		// Mount the goddamn thing
		root.appendChild(this.renderer.domElement);
		this.$destruct.once(() => root.removeChild(this.renderer.domElement));

		const handleResize = this.$resize.emit.bind(this.$resize);
		window.addEventListener('resize', handleResize);
		this.$destruct.once(() => window.removeEventListener('resize', handleResize));

		const handleCameraChange = this.$camera.emit.bind(this.$camera);
		this.controls.addEventListener('change', handleCameraChange);
		this.$destruct.once(() => this.controls.removeEventListener('change', handleCameraChange));

		const handleClick = this._handleClick.bind(this);
		this.root.addEventListener('click', handleClick);
		this.$destruct.once(() => this.root.removeEventListener('click', handleClick));
	}

	/**
	 * Do the opposite of constructing a ThreeController
	 */
	public destructor() {
		this.$destruct.emit();
	}

	/**
	 * Handle a mouse click anywhere in the ThreeJS canvas. Use raycasting to find the objects the
	 * click ray intersects with. Then emits an event ($clickTile or $clickEntity) accordingly.
	 */
	private _handleClick(event: MouseEvent) {
		// https://stackoverflow.com/questions/12800150/
		this.raycaster.setFromCamera(
			new Vector2(
				(event.offsetX / this.root.clientWidth) * 2 - 1,
				-(event.offsetY / this.root.clientHeight) * 2 + 1,
			),
			this.camera,
		);
		const intersections = this.raycaster.intersectObjects(this.scene.children, true);
		for (let i = 0; i < intersections.length; i++) {
			const userData = intersections[i].object.userData;
			if (userData.tile) {
				return this.$clickTile.emit(event, userData.tile);
			}
			if (userData.entity) {
				return this.$clickEntity.emit(event, userData.entity);
			}
		}

		// If click wasn't anything more specific, trigger a normal click event and include all intersections.
		this.$click.emit(event);
	}

	private getViewportSize() {
		const boundingClientRect = this.root.getBoundingClientRect();
		return {
			width: boundingClientRect.width,
			height: boundingClientRect.height,
			aspect: boundingClientRect.width / boundingClientRect.height,
		};
	}

	/**
	 * Position the camera at a game coordinate
	 */
	public setCameraPosition(position: CoordinateI) {
		const v = convertCoordinate(position);
		this.camera.position.set(v.x, v.y, v.z);
	}

	/**
	 * Point the camera right at a game coordinate
	 */
	public setCameraFocus(coordinate: CoordinateI) {
		this.setCameraFocusOnVector3(convertCoordinate(coordinate));
	}

	/**
	 * Point the camera right at a ThreeJS coordinate
	 */
	private setCameraFocusOnVector3(vector: THREE.Vector3) {
		this.camera.lookAt(vector);
		this.controls.target = vector;
	}

	/**
	 * Point the camera right at a ThreeJS mesh
	 */
	public setCameraFocusMesh(mesh: THREE.Mesh) {
		const geometry = mesh.geometry;
		const center = new THREE.Vector3();
		geometry.computeBoundingBox();
		geometry.boundingBox?.getCenter(center);
		mesh.localToWorld(center);

		this.setCameraFocusOnVector3(center);
	}

	/**
	 * Show a 3D cross-hair in red, blue and green, correlating to X, Y and Z
	 */
	public addAxisHelper(position: CoordinateI = new Coordinate(0, 0, 0), size = 10) {
		const v = convertCoordinate(position);
		const axesHelper = new THREE.AxesHelper(size);
		axesHelper.position.set(v.x, v.y, v.z);
		this.scene.add(axesHelper);
	}

	/**
	 * Add the game terrain geometry to canvas. This tells ThreeJS to render terrain where there
	 * are tiles.
	 */
	private createGroupForGameTerrain(game: Game, options: { fill: boolean; edge: boolean }) {
		var group = new THREE.Group();

		const loop = game.terrain.tiles
			.filter((t) => t.isLand())
			.map((tile: TileI) => {
				const outline = tile
					.getOutlineCoordinates()
					.map((coord) => new THREE.Vector2(tile.x + coord.x, -tile.y - coord.y));
				const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
					steps: 1,
					depth: tile.z,
					bevelEnabled: false,
				});
				return {
					tile,
					geometry,
				};
			});

		if (options.fill) {
			loop.forEach(({ geometry, tile }) => {
				const mesh = new THREE.Mesh(geometry, MATERIAL_TERRAIN);
				mesh.userData.tile = tile;
				group.add(mesh);
			});
		}

		if (options.edge) {
			loop.forEach(({ geometry }) => {
				const edges = new THREE.EdgesGeometry(geometry);
				const line = new THREE.LineSegments(edges, MATERIAL_LINES);
				group.add(line);
			});
		}

		group.rotateX(-Math.PI / 2);
		return group;
	}

	/**
	 * Start the game in this ThreeJS instance. Render all entities and terrain, set all
	 * event listeners.
	 */
	public attachToGame(game: Game) {
		super.attachToGame(game);

		this.attachToGameEvents(game);

		// Meshes
		game.entities.forEach((entity) => {
			this.attachToGameEntity(game, entity);
		});

		const group = new THREE.Group();
		group.add(this.createGroupForGameTerrain(game, { fill: true, edge: true }));

		// https://threejs.org/docs/#api/en/helpers/GridHelper
		const gameSize = (game.terrain as Terrain).size;
		const gridHelper = new THREE.GridHelper(
			gameSize,
			gameSize,
			activePalette.medium,
			activePalette.medium,
		);
		gridHelper.position.add(new THREE.Vector3(gameSize / 2, 0, gameSize / 2));
		group.add(gridHelper);

		this.scene.add(group);

		this.setCameraPosition(new Coordinate(-5, -5, 20));
		this.setCameraFocus(game.$$cameraFocus.get());
	}

	/**
	 * Listen to some game event, and some of ThreeController's own vents, and bind them
	 * with the appropriate methods on the other side of the fence.
	 *
	 * All events are destroyed when the controller detaches from game.
	 */
	private attachToGameEvents(game: Game) {
		// On every frame, update the game clock with Three.js progress
		this.$detach.once(
			this.$update.on(() => {
				const d = this.clock.getDelta();
				game.time.steps(d * 1000 * game.time.multiplier);
			}),
		);
		// When a tile is clicked, open game context menu
		this.$detach.once(
			this.$clickTile.on((event, tile) => {
				event.preventDefault();
				event.stopPropagation();
				game.openContextMenuOnTile(tile);
			}),
		);
		// When an entity is clicked, focus it in game UI
		this.$detach.once(
			this.$clickEntity.on((event, entity) => {
				event.preventDefault();
				event.stopPropagation();
				game.$$focus.set(entity);
				game.closeContextMenu();
			}),
		);
		// When anything else is clicked, close context menu
		this.$detach.once(
			this.$click.on((event) => {
				event.preventDefault();
				game.closeContextMenu();
				// @TODO
			}),
		);

		// Put the camera onto this entity, and follow it around.
		this.$detach.once(
			game.$$cameraFocus.on(() => {
				this.setCameraFocus(game.$$cameraFocus.get());
			}),
		);

		// When the focused entity changes to a settlement, different "relationship arcs" are drawn
		// between that settlement and neighbors/trade partners/etc.
		const arcs: (() => void)[] = [];
		this.$detach.once(
			game.$$focus.on((thing) => {
				arcs.forEach((arc) => arc());
				arcs.splice(0, arcs.length);

				if (!(thing instanceof SettlementEntity)) {
					return;
				}
				const relationships = game.entities.filter(
					(e) => e instanceof SettlementEntity && e !== thing,
				);
				relationships.forEach((rel) => {
					arcs.push(this.showRelationshipArc(thing.$$location.get(), rel.$$location.get()));
				});
			}),
		);
	}

	/**
	 * Add an entity to canvas, and make sure it can update/animate. Contains some logic to handle
	 * one type of entity different from another.
	 */
	private attachToGameEntity(game: Game, entity: EntityI) {
		const obj = entity.createObject();
		obj.position.copy(convertCoordinate(entity.$$location.get()));
		if (entity instanceof PersonEntity) {
			this.attachEntityPersonEvents(game, entity, obj);
		}
		this.scene.add(obj);
	}

	/**
	 * Listen to the events of a person event --> walking, mostly.
	 *
	 * @bug there's some bugs, see code comments
	 */
	private attachEntityPersonEvents(game: Game, entity: EntityPersonI, obj: THREE.Group) {
		// @TODO handle when the entity is removed, but the game is not detached entirely

		let destroy: (() => void) | null;

		// @TODO maybe invent TweenedValue (as a specialization of EventedValue and the update loop)
		// some time.
		// @TODO destroy event listener when entity stops being part of the game
		entity.$startedWalking.on((destination, duration) => {
			const deltaGameCoordinatePerFrame = Coordinate.difference(
				destination,
				entity.$$location.get(),
			).scale(1 / duration);
			const deltaThreeCoodinatePerFrame = convertCoordinate(deltaGameCoordinatePerFrame);
			destroy = game.time.on(() => {
				// @TODO maybe add an easing function some time
				obj.position.x += deltaThreeCoodinatePerFrame.x;
				obj.position.y += deltaThreeCoodinatePerFrame.y;
				obj.position.z += deltaThreeCoodinatePerFrame.z;
				entity.$$location.set(
					// @BUG
					// This event should not update the $$location because $$location is a tile,
					// which lives in Terrain.
					//
					// @TODO
					// As a fix, entity location should be a coordinate, which must at various places
					// be mapped back to a tile, if a tile is needed.
					Coordinate.transform(entity.$$location.get(), deltaGameCoordinatePerFrame),
				);
				if (--duration <= 0) {
					entity.$stoppedWalkStep.emit(destination);
				}
			});
		});
		const stop = () => {
			destroy && destroy();
		};
		entity.$stoppedWalkStep.on(stop);
		this.$detach.once(stop);
	}

	/**
	 * Open an HTML element on the given 3D coordinate, and keep it there when the camera moves etc.
	 *
	 * Returns a function with which the element can be removed again, and all event handlers unset.
	 *
	 * Can be easily used in React by mounting {@link ThreeOverlay}.
	 */
	public openHtmlOverlay(coordinate: CoordinateI, element: HTMLElement) {
		this.root.appendChild(element);

		// Compute normalized device coordinate and CSS positioning
		//   https://jsfiddle.net/jsfiddle_lyke_be/w3n5e1tr/2/
		const updateOverlayPositions = () => {
			this.camera.updateMatrixWorld();
			const ndc = convertCoordinate(coordinate).project(this.camera);
			const x = (ndc.x * 0.5 + 0.5) * this.root.clientWidth;
			const y = (ndc.y * -0.5 + 0.5) * this.root.clientHeight;
			element.style.position = 'absolute';
			element.style.zIndex = '1';
			element.style.left = `${Math.round(x)}px`;
			element.style.top = `${Math.round(y)}px`;
			element.style.width = `0`;
			element.style.height = `0`;
			element.style.overflow = `visible`;
		};

		const stopRespondingToCamera = this.$camera.on(updateOverlayPositions);
		const stopRespondingToResize = this.$resize.on(updateOverlayPositions);
		updateOverlayPositions();

		return () => {
			this.root.removeChild(element);
			stopRespondingToCamera();
			stopRespondingToResize();
		};
	}

	showRelationshipArc(from: CoordinateI, to: CoordinateI) {
		console.log('From', from);
		console.log('To', to);
		const length = from.euclideanDistanceTo(to);
		console.log('Distance', length);
		const curve = new THREE.EllipseCurve(
			length / 2,
			0, // ax, aY
			length / 2,
			length / 4,
			0,
			Math.PI,
			false, // aClockwise
			0, // aRotation
		);

		const points = curve.getPoints(50);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({ color: activePalette.light });
		const ellipse = new THREE.Line(geometry, material);
		ellipse.position.copy(convertCoordinate(new Coordinate(from.x, from.y, 0.1)));
		ellipse.rotateY(-from.angleTo(to));
		this.scene.add(ellipse);

		return () => {
			this.scene.remove(ellipse);
		};
	}
	/*
		THE RENDER LOOP
		---------------------------
	*/

	/**
	 * Start the animation loop
	 */
	public startAnimationLoop() {
		super.startAnimationLoop();

		const animate = () => {
			if (!this.$$animating.get()) {
				return;
			}
			requestAnimationFrame(animate);
			this.renderAnimationFrame();
		};

		animate();
	}

	/**
	 * Call for all objects etc. to be updated, and render once.
	 */
	private renderAnimationFrame() {
		this.$update.emit();
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}
}
