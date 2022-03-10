import * as THREE from 'three';
import { Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Event } from '../../classes/Event';
import { terrainColors } from '../../constants/palettes';
import { GuardEntity } from '../../entities/GuardPersonEntity';
import { Game } from '../../Game';
import { CoordinateI, TileI } from '../../types';
import { convertCoordinate } from './utils';

type ThreeControllerOptions = {
	backgroundColor: number;
	/**
	 * Set to `Infinity` for isometric view, or a value between 45 and 70 for a normal-ish camera
	 */
	fieldOfView: number;
};

export class ThreeController {
	animating: boolean = false;

	/**
	 * The element into which the ThreeJS canvas as well as any overlay elements are placed
	 */
	root: HTMLElement;
	scene: THREE.Scene;
	renderer: THREE.Renderer;
	camera: THREE.Camera;
	controls: OrbitControls;
	raycaster: THREE.Raycaster;

	/**
	 * Maps meshes to the tiles they belong to. Useful for calculating which tile was clicked, if
	 * raycasting determines the click intersects with a mesh
	 */
	tilesByMesh = new WeakMap<THREE.Mesh, TileI>();

	/**
	 * The event that the viewport is resized
	 */
	$resize = new Event('viewport resize');

	/**
	 * The event that the camera moves, or as ThreeJS puts it:
	 *   "Fires when the camera has been transformed by the controls.""
	 */
	$camera = new Event('camera move');

	/**
	 * The event that the ThreeJS canvas is clicked. Event data is an array of all objects that
	 * intersect with the click.
	 */
	$click = new Event<[THREE.Intersection[]]>('left mouse button');
	// $contextMenu = new Event<[MouseEvent]>('right mouse button');

	public constructor(root: HTMLElement, options: ThreeControllerOptions) {
		this.root = root;

		// https://threejs.org/docs/#api/en/scenes/Scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(terrainColors.dark);

		// https://threejs.org/docs/#api/en/renderers/WebGLRenderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});

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
			this.$resize.on(() => {
				const { aspect, width, height } = this.getViewportSize();
				const camera = this.camera as THREE.OrthographicCamera;
				camera.left = (-frustumSize * aspect) / 2;
				camera.right = (frustumSize * aspect) / 2;
				camera.top = frustumSize / 2;
				camera.bottom = -frustumSize / 2;
				camera.updateProjectionMatrix();
				this.renderer.setSize(width, height);
			});
		} else {
			this.camera = new THREE.PerspectiveCamera(options.fieldOfView, aspect, 0.1, 1000);
			this.$resize.on(() => {
				const { aspect, width, height } = this.getViewportSize();
				const camera = this.camera as THREE.PerspectiveCamera;
				camera.aspect = aspect;
				camera.updateProjectionMatrix();
				this.renderer.setSize(width, height);
			});
		}
		this.camera.position.set(20, 20, 20);
		this.$resize.emit();

		// Set the camera controls;
		//   https://threejs.org/docs/#examples/en/controls/OrbitControls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.maxPolarAngle = 0.45 * Math.PI;
		this.controls.enableZoom = true;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;

		// Add an axis helper;
		const axesHelper = new THREE.AxesHelper(10);
		axesHelper.layers.enableAll();
		this.scene.add(axesHelper);

		// https://threejs.org/docs/#api/en/core/Raycaster
		this.raycaster = new THREE.Raycaster();

		// Mount the goddamn thing
		root.appendChild(this.renderer.domElement);
		window.addEventListener('resize', this.$resize.emit.bind(this.$resize));
		this.controls.addEventListener('change', this.$camera.emit.bind(this.$camera));
		this.root.addEventListener('click', event => {
			// https://stackoverflow.com/questions/12800150/
			event.preventDefault();
			this.raycaster.setFromCamera(
				new Vector2(
					(event.offsetX / this.root.clientWidth) * 2 - 1,
					-(event.offsetY / this.root.clientHeight) * 2 + 1
				),
				this.camera
			);
			this.$click.emit(this.raycaster.intersectObjects(this.scene.children, true));
		});
	}

	private getViewportSize() {
		const boundingClientRect = this.root.getBoundingClientRect();
		return {
			width: boundingClientRect.width,
			height: boundingClientRect.height,
			aspect: boundingClientRect.width / boundingClientRect.height
		};
	}

	public setCameraFocus(coordinate: CoordinateI) {
		this.camera.lookAt(convertCoordinate(coordinate));
		this.controls.target = convertCoordinate(coordinate);
	}

	public initForGame(game: Game) {
		this.setCameraFocus(game.terrain.getMedianCoordinate());

		// Render tile polygons;
		this.scene.add(
			((options: { fill: boolean; edge: boolean }) => {
				var group = new THREE.Group();

				const loop = game.terrain.tiles
					.filter(t => t.isLand())
					.map((tile: TileI) => {
						const shape = new THREE.Shape(
							tile
								.getOutlineCoordinates()
								.map(coord => new THREE.Vector2(tile.x + coord.x, tile.y + coord.y))
						);
						const geometry = new THREE.ShapeGeometry(shape);
						return {
							tile,
							geometry
						};
					});

				if (options.fill) {
					const material = new THREE.MeshBasicMaterial({
						color: terrainColors.medium
					});
					loop.forEach(({ geometry, tile }) => {
						const mesh = new THREE.Mesh(geometry, material);
						group.add(mesh);
						this.tilesByMesh.set(mesh, tile);
					});
				}

				if (options.edge) {
					const material = new THREE.LineBasicMaterial({
						color: terrainColors.darkest,
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
			})({ fill: true, edge: true })
		);

		// Render entities;
		this.scene.add(
			(function createEntitiesGroup(options: { wireframe: boolean }) {
				var group = new THREE.Group();
				game.entities.forEach(entity => {
					if (!entity.location) {
						return;
					}
					const geometry =
						entity instanceof GuardEntity
							? new THREE.IcosahedronGeometry(0.2)
							: new THREE.TetrahedronGeometry(0.2);
					const material = new THREE.MeshBasicMaterial({
						color: terrainColors.light
					});
					const mesh = new THREE.Mesh(geometry, material);
					mesh.position.copy(convertCoordinate(entity.location)).setY(0.2);
					group.add(mesh);

					const edges = new THREE.EdgesGeometry(geometry);
					const line = new THREE.LineSegments(
						edges,
						new THREE.LineBasicMaterial({ color: terrainColors.darkest, linewidth: 1 })
					);
					line.position.copy(convertCoordinate(entity.location)).setY(0.2);
					group.add(line);
				});

				return group;
			})({ wireframe: false })
		);
	}

	private renderOnce() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

	public startAnimationLoop() {
		if (this.animating) {
			throw new Error('Animation already started');
		}

		const animate = () => {
			if (!this.animating) {
				return;
			}
			requestAnimationFrame(animate);
			this.renderOnce();
		};
		this.animating = true;
		animate();
	}

	public stopAnimationLoop() {
		this.animating = false;
	}

	openHtmlOverlay(coordinate: CoordinateI, element: HTMLElement) {
		// Mount DOM
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
		MATERIALS
	*/
	// private materials: { [name: string]: THREE.Material } = {};
	// private getMaterial(name: string): THREE.Material {
	// 	const item = this.materials[name];
	// 	if (!item) {
	// 		throw new Error(`No such material: "${name}"`);
	// 	}
	// 	return item;
	// }
	// private setMaterial(name: string, material: THREE.Material) {
	// 	this.materials[name] = material;
	// }
	// private removeMaterial(name: string): void {
	// 	const item = this.getMaterial(name);
	// 	// @TODO
	// }
}
