import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { factoryArchetype } from '../../lib/level-1/ecs/archetypes/factoryArchetype';
import { mapMarkerArchetype } from '../../lib/level-1/ecs/archetypes/mapMarkerArchetype';
import { marketArchetype } from '../../lib/level-1/ecs/archetypes/marketArchetype';
import { personArchetype } from '../../lib/level-1/ecs/archetypes/personArchetype';
import { generateEmptyGame } from '../../lib/test/generateEmptyGame';
import { GameContext } from '../../ui2/contexts/GameContext';
import { ReplacementSpaceContext } from '../../ui2/contexts/ReplacementSpaceContext';
import { EntityBadge } from './EntityBadge';

const meta: Meta<typeof EntityBadge> = {
	title: 'UI/Entities/EntityBadge',
	component: EntityBadge,
	parameters: {
		layout: 'centered',
	},
	beforeAll: async () => {
		await dwarfEntity.events.add('Just arrived at work');
	},
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<GameContext game={generateEmptyGame().game}>
				<ReplacementSpaceContext>
					<Story />
				</ReplacementSpaceContext>
			</GameContext>
		),
	],
};

export default meta;
type Story = StoryObj<typeof EntityBadge>;

// Person (Dwarf) entity
const dwarfEntity = personArchetype.create({
	location: [0, 0, 0],
	name: 'Gimli Stonebeard',
	icon: '🧔',
	behavior: null,
	wealth: 100,
});
export const Dwarf: Story = {
	args: {
		entity: dwarfEntity,
	},
};

// Factory entity
const factoryEntity = factoryArchetype.create({
	location: [1, 1, 0],
	owner: dwarfEntity,
	blueprint: {
		ingredients: [],
		products: [],
		time: 1000,
	},
	maxWorkers: 5,
	maxStackSpace: 100,
	name: 'Stone Processing Plant',
	icon: '🏭',
});
export const Factory: Story = {
	args: {
		entity: factoryEntity,
	},
};

// Market entity
const marketEntity = marketArchetype.create({
	location: [2, 2, 0],
	owner: dwarfEntity,
	materials: [],
	maxStackSpace: 200,
	name: 'Dwarven Market',
	icon: '🏪',
});
export const Market: Story = {
	args: {
		entity: marketEntity,
	},
};

// Map marker entity
const markerEntity = mapMarkerArchetype.create({
	location: [3, 3, 0],
	name: 'Treasure Chamber',
	icon: '💎',
});
export const MapMarker: Story = {
	args: {
		entity: markerEntity,
	},
};

export const NoEvents: Story = {
	args: {
		entity: markerEntity,
	},
};

export const NoName: Story = {
	args: {
		entity: {
			...markerEntity,
			name: undefined,
		},
	},
};

export const NoIcon: Story = {
	args: {
		entity: {
			...markerEntity,
			icon: undefined,
		},
	},
};
