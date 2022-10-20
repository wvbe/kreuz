import { FunctionComponent, useMemo } from 'react';
import { blueprints } from '@lib';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { InventoryBag } from './IntentoryUI.tsx';

const blueprintsList = Object.keys(blueprints).map(
	(key) => blueprints[key as keyof typeof blueprints],
);

export const BlueprintList: FunctionComponent = () => {
	const items = useMemo(
		() =>
			blueprintsList.map((blueprint, i) => (
				<Row key={i}>
					<Cell>{blueprint.name}</Cell>
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
	return <Table>{items}</Table>;
};
