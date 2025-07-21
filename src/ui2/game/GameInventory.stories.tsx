import { action } from '@storybook/addon-actions';
import { Meta, StoryFn } from '@storybook/react';
import { Inventory } from '../../lib/level-1/ecs/components/inventoryComponent/Inventory';
import { Material } from '../../lib/level-1/inventory/Material';
import { GameInventory } from './GameInventory';

// Define some random materials
const wood = new Material('Wood', { symbol: 'W', stackSize: 10, value: 5 });
const stone = new Material('Stone', { symbol: 'S', stackSize: 5, value: 3 });
const iron = new Material('Iron', { symbol: 'I', stackSize: 8, value: 10 });

// Create an instance of Inventory
const inventory = new Inventory(10);

// Add some initial items to the inventory
inventory.changeMultiple([
	{ material: wood, quantity: 20 },
	{ material: stone, quantity: 10 },
	{ material: iron, quantity: 5 },
]);

export default {
	title: 'Game/GameInventory',
	component: GameInventory,
} as Meta<typeof GameInventory>;

const Template: StoryFn<typeof GameInventory> = (args) => <GameInventory {...args} />;

export const Default = Template.bind({});
Default.args = {
	inventory,
};

// Add actions to randomly add or remove items
Default.play = async () => {
	const addItem = action('addItem');
	const removeItem = action('removeItem');

	// Randomly add or remove items
	setInterval(() => {
		const material = [wood, stone, iron][Math.floor(Math.random() * 3)];
		const quantity = Math.floor(Math.random() * 5) + 1;
		const add = Math.random() > 0.5;

		if (add) {
			inventory.change(material, quantity);
			addItem(`${quantity}x ${material.label}`);
		} else {
			inventory.change(material, -quantity);
			removeItem(`${quantity}x ${material.label}`);
		}
	}, 2000);
};
