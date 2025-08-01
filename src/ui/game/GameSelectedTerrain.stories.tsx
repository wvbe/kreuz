import type { Meta, StoryObj } from '@storybook/react';
import { Terrain } from '../../game/core/terrain/Terrain';
import { generateEmptyGame } from '../../game/test/generateEmptyGame';
import { GameContext } from '../contexts/GameContext';
import { setSelectedTerrain } from '../stores/selectedTerrainStore';
import { GameSelectedTerrain } from './GameSelectedTerrain';

const meta: Meta<typeof GameSelectedTerrain> = {
	title: 'Game/GameSelectedTerrain',
	component: GameSelectedTerrain,
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		(Story) => {
			const game = generateEmptyGame();
			return (
				<GameContext game={game}>
					<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
						<Story />
					</div>
				</GameContext>
			);
		},
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story showing GameSelectedTerrain with no selected terrain,
 * so it falls back to game.terrain.
 */
export const Default: Story = {
	args: {},
};

/**
 * Story demonstrating GameSelectedTerrain with a custom selected terrain.
 */
export const WithSelectedTerrain: Story = {
	args: {},
	play: async () => {
		// Create a custom terrain and set it as selected
		const customTerrain = new Terrain({
			id: 'custom-terrain',
		});
		setSelectedTerrain(customTerrain);
	},
};

/**
 * Story showing GameSelectedTerrain with tile paint mode enabled.
 */
export const WithTilePaintMode: Story = {
	args: {
		tilePaintMode: {
			id: 'example-paint-mode',
			highlightColor: { rgb: () => ({ r: 255, g: 0, b: 0 }) } as any,
			onDragComplete: (tiles) => {
				console.log('Paint drag completed with tiles:', tiles);
			},
		},
	},
};
