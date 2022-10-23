import { FunctionComponent, useMemo } from 'react';
import { blueprints } from '@lib';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { InventoryBag } from './InventoryUI.tsx';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';

const blueprintsList = Object.keys(blueprints).map(
	(key) => blueprints[key as keyof typeof blueprints],
);

export const BlueprintList: FunctionComponent = () => {
	const items = useMemo(
		() =>
			blueprintsList.map((blueprint, i) => (
				<Row key={i}>
					<Cell>{blueprint.name}</Cell>
					<Cell>{(1000 / blueprint.options.fullTimeEquivalent).toFixed(1)}/hour</Cell>
					<Cell>{(blueprint.options.fullTimeEquivalent / 1000).toFixed(1)}/hour</Cell>
					<Cell>
						<InventoryBag stacks={blueprint.ingredients} />
					</Cell>
					<Cell>
						<InventoryBag stacks={blueprint.products} />
					</Cell>
				</Row>
			)),
		[],
	);
	return (
		<CollapsibleWindow label={`Blueprints`}>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
