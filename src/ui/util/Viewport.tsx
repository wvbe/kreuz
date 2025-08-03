import panzoom, { PanZoom } from 'panzoom';
import React, { useEffect, useRef, type FunctionComponent, type ReactNode } from 'react';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useGameContext } from '../contexts/GameContext';
import { setViewportControls } from '../stores/selectedActionStore';
import { getSelectedTerrain } from '../stores/selectedTerrainStore';

export type ViewportControls = {
	getPanzoomInstance(): PanZoom | null;
	getPanzoomContainer(): HTMLDivElement;
	getCoordinateFromContainerPixels(x: number, y: number): QualifiedCoordinate;
};

export const defaultViewportControls: ViewportControls = {
	getPanzoomInstance() {
		return null;
	},
	getPanzoomContainer() {
		throw new Error('Not implemented');
	},
	getCoordinateFromContainerPixels() {
		throw new Error('Not implemented');
	},
};

/**
 * The amount of pixels given to the length and width of one tile (= 1 game distance) at panzoom scale 1.
 */
const GAME_LENGTH_TO_PIXELS = 32;

const outerStyle: React.CSSProperties = {
	position: 'absolute',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	zIndex: 1,
	overflow: 'hidden',
};

const innerStyle = {
	width: '100%',
	height: '100%',
};

/**
 * A component that wraps its children in a pannable and zoomable viewport.
 * Uses the panzoom library to enable:
 * - Panning via mouse drag or touch
 * - Zooming via mouse wheel or pinch gesture
 * - Bounded movement with 10% padding
 * - Zoom limits between 0.5x and 2x
 *
 * The viewport takes up the full window size and prevents content from overflowing.
 */
export const Viewport: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	const game = useGameContext();
	const panzoomRef = useRef<PanZoom | null>(null);
	const outerElementRef = useRef<HTMLDivElement | null>(null);
	const innerElementRef = useRef<HTMLDivElement | null>(null);
	const canvasElementRef = useRef<HTMLDivElement | null>(null);

	// Set up panzoom on the inner element
	useEffect(() => {
		if (!innerElementRef.current || !outerElementRef.current || panzoomRef.current) {
			return;
		}

		canvasElementRef.current = innerElementRef.current.querySelector<HTMLDivElement>(
			'[data-component="GameMap"]',
		);
		if (canvasElementRef.current) {
			canvasElementRef.current.style.fontSize = `${GAME_LENGTH_TO_PIXELS}px`;
		}

		panzoomRef.current = panzoom(innerElementRef.current, {
			bounds: true,
			boundsPadding: 0.1,
			maxZoom: 2,
			minZoom: 0.5,
		});

		const controls: ViewportControls = {
			getPanzoomInstance() {
				return panzoomRef.current;
			},
			getPanzoomContainer() {
				if (!outerElementRef.current) {
					throw new Error('Outer element not found');
				}
				return outerElementRef.current;
			},
			getCoordinateFromContainerPixels(x: number, y: number) {
				if (!panzoomRef.current) {
					throw new Error('Panzoom not initialized');
				}
				if (!canvasElementRef.current) {
					throw new Error('Canvas element not found');
				}
				const { scale } = panzoomRef.current.getTransform();
				const { x: dx, y: dy } = canvasElementRef.current.getBoundingClientRect()!;
				return [
					getSelectedTerrain() ?? game.terrain,
					...[x - dx, y - dy].map((c) => c / scale / GAME_LENGTH_TO_PIXELS),
					0,
				] as QualifiedCoordinate;
			},
		};
		setViewportControls(controls);

		console.log('panzoomcontrols set', controls);
		return () => {
			panzoomRef.current?.dispose();
			panzoomRef.current = null;
			setViewportControls(defaultViewportControls);
		};
	}, []);

	return (
		<div ref={outerElementRef} style={outerStyle}>
			<div ref={innerElementRef} style={innerStyle}>
				{children}
			</div>
		</div>
	);
};
