import * as THREE from 'three';
import { Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Coordinate } from '../../classes/Coordinate';
import { Event } from '../../classes/Event';
import { activePalette } from '../../constants/palettes';
import { Game } from '../../Game';
import { DualMeshTerrain } from '../../terrain/DualMeshTerrain';
import { CoordinateI, EntityI, EntityPersonI, TileI, ViewI } from '../../types';
import { createEntityObject } from './entities';
import { convertCoordinate } from './utils';

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

export class ThreeController implements ViewI {
	public animating: boolean = false;

	public scene: THREE.Scene;
	public renderer: THREE.WebGLRenderer;
	public camera: THREE.Camera;
	public controls: OrbitControls;
	public raycaster: THREE.Raycaster;

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
		'ThreeController#$clickEntity'
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
		// @TODO remove these event listeners from the place where they are set.
		this.$detach.once(() => {
			this.$camera.clear();
			// this.$resize.clear();
			this.$click.clear();
			this.$clickEntity.clear();
			this.$clickTile.clear();
		});

		this.root = root;

		// https://threejs.org/docs/#api/en/scenes/Scene
		this.scene = new THREE.Scene();

		// https://threejs.org/docs/#api/en/renderers/WebGLRenderer
		this.renderer =
			RENDERER_BY_ELEMENT.get(root) ||
			new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
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
				1000
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
					this.renderer.setSize(
						width * options.pixelRatio,
						height * options.pixelRatio,
						false
					);
				})
			);
		} else {
			this.camera = new THREE.PerspectiveCamera(options.fieldOfView, aspect, 0.1, 1000);
			this.$destruct.once(
				this.$resize.on(() => {
					const { aspect, width, height } = this.getViewportSize();
					const camera = this.camera as THREE.PerspectiveCamera;
					camera.aspect = aspect;
					camera.updateProjectionMatrix();
					this.renderer.setSize(
						width * options.pixelRatio,
						height * options.pixelRatio,
						false
					);
				})
			);
		}
		this.$resize.emit();
		this.renderer.domElement.style.width = '100%';
		this.renderer.domElement.style.height = '100%';

		// Set the camera controls;
		//   https://threejs.org/docs/#examples/en/controls/OrbitControls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		if (options.restrictCameraAngle) {
			this.controls.maxPolarAngle = 0.45 * Math.PI;
		}
		this.controls.enableZoom = options.enableZoom;
		this.controls.enableDamping = true;
		this.controls.enablePan = options.enablePan;
		this.controls.dampingFactor = 0.1;
		this.controls.autoRotate = options.enableAutoRotate;
		this.$destruct.once(this.controls.dispose.bind(this.controls));

		// https://threejs.org/docs/#api/en/core/Raycaster
		// @TODO maybe can be global?
		this.raycaster = new THREE.Raycaster();

		// Mount the goddamn thing
		root.appendChild(this.renderer.domElement);
		this.$destruct.once(() => root.removeChild(this.renderer.domElement));

		const handleResize = this.$resize.emit.bind(this.$resize);
		window.addEventListener('resize', handleResize);
		this.$destruct.once(() => window.removeEventListener('resize', handleResize));

		const handleCameraChange = this.$camera.emit.bind(this.$camera);
		this.controls.addEventListener('change', handleCameraChange);
		this.$destruct.once(() => this.controls.removeEventListener('change', handleCameraChange));

		const handleClick = this.handleClick.bind(this);
		this.root.addEventListener('click', handleClick);
		this.$destruct.once(() => this.root.removeEventListener('click', handleClick));
	}

	public destructor() {
		this.$destruct.emit();
	}

	private handleClick(event: MouseEvent) {
		// https://stackoverflow.com/questions/12800150/
		this.raycaster.setFromCamera(
			new Vector2(
				(event.offsetX / this.root.clientWidth) * 2 - 1,
				-(event.offsetY / this.root.clientHeight) * 2 + 1
			),
			this.camera
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
			aspect: boundingClientRect.width / boundingClientRect.height
		};
	}

	public setCameraPosition(position: CoordinateI) {
		const v = convertCoordinate(position);
		this.camera.position.set(v.x, v.y, v.z);
	}

	public setCameraFocus(coordinate: CoordinateI) {
		this.camera.lookAt(convertCoordinate(coordinate));
		this.controls.target = convertCoordinate(coordinate);
	}

	public addAxisHelper(position: CoordinateI = new Coordinate(0, 0, 0), size = 10) {
		const v = convertCoordinate(position);
		const axesHelper = new THREE.AxesHelper(size);
		axesHelper.position.set(v.x, v.y, v.z);
		this.scene.add(axesHelper);
	}

	/*
		ACTIVATE GAME STUFF AND THEIR LISTENERS
		---------------------------------------
	*/

	/**
	 * Add an entity to canvas, and make sure it can update/animate
	 */
	private attachEntity(entity: EntityI) {
		if (!entity.location) {
			return;
		}
		const obj = createEntityObject(entity);
		const location = Coordinate.clone(entity.location).transform(0, 0, 0.175);
		obj.position.copy(convertCoordinate(location));
		this.scene.add(obj);

		// @TODO listeners for walking around etc.
	}

	/**
	 * Add the game terrain geometry to canvas
	 */
	private createGroupForGameTerrain(game: Game, options: { fill: boolean; edge: boolean }) {
		var group = new THREE.Group();

		const loop = game.terrain.tiles
			.filter(t => t.isLand())
			.map((tile: TileI) => {
				const outline = tile
					.getOutlineCoordinates()
					.map(coord => new THREE.Vector2(tile.x + coord.x, -tile.y - coord.y));
				const geometry = new THREE.ShapeGeometry(new THREE.Shape(outline));
				geometry.translate(0, 0, tile.z);
				return {
					tile,
					geometry
				};
			});

		if (options.fill) {
			const material = new THREE.MeshBasicMaterial({
				color: activePalette.medium
				// wireframe: true
			});
			loop.forEach(({ geometry, tile }) => {
				const mesh = new THREE.Mesh(geometry, material);
				mesh.userData.tile = tile;
				group.add(mesh);
			});
		}

		if (options.edge) {
			const material = new THREE.LineBasicMaterial({
				color: activePalette.darkest,
				linewidth: 1
			});
			loop.forEach(({ geometry }) => {
				const edges = new THREE.EdgesGeometry(geometry);
				const line = new THREE.LineSegments(edges, material);
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
		this.$start.once(game.play.bind(game));
		this.$detach.once(game.destroy.bind(game));

		// Event handlers
		this.$detach.once(
			this.$clickTile.on((event, tile) => {
				event.preventDefault();
				event.stopPropagation();
				game.openContextMenuOnTile(tile);
			})
		);
		this.$detach.once(
			this.$clickEntity.on((event, entity) => {
				event.preventDefault();
				event.stopPropagation();
				game.focus.set(entity);
				game.contextMenu.close();
			})
		);
		this.$detach.once(
			this.$click.on(event => {
				event.preventDefault();
				game.contextMenu.close();
				// @TODO
			})
		);
		this.$detach.once(
			game.lookAt.$change.on(() => {
				this.setCameraFocus(game.lookAt.get());
			})
		);

		// Meshes
		game.entities.forEach(entity => {
			this.attachEntity(entity);
		});

		const group = new THREE.Group();
		group.add(this.createGroupForGameTerrain(game, { fill: true, edge: true }));

		// https://threejs.org/docs/#api/en/helpers/GridHelper
		const gameSize = (game.terrain as DualMeshTerrain).size;
		const gridHelper = new THREE.GridHelper(
			gameSize,
			gameSize,
			activePalette.medium,
			activePalette.medium
		);
		gridHelper.position.add(new THREE.Vector3(gameSize / 2, 0, gameSize / 2));
		group.add(gridHelper);

		this.scene.add(group);

		this.setCameraPosition(new Coordinate(-5, -5, 20));
		this.setCameraFocus(game.lookAt.get());
	}

	/**
	 * The opposite of attaching to a game
	 */
	public detachFromGame() {
		this.$detach.emit();
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

	/*
		THE RENDER LOOP
		---------------------------
	*/

	/**
	 * Start the animation loop
	 */
	public startAnimationLoop() {
		if (this.animating) {
			// @TODO maybe just return early.
			throw new Error('Animation already started');
		}

		const animate = () => {
			if (!this.animating) {
				return;
			}
			requestAnimationFrame(animate);
			this.renderAnimationFrame();
		};

		this.animating = true;

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

	/**
	 * Stop the animation loop, the opposite of startAnimationLoop(). Will also fire the opposite event.
	 */
	public stopAnimationLoop() {
		if (!this.animating) {
			// @TODO maybe just return early.
			throw new Error('Animation not started');
		}
		this.animating = false;
	}
}
