import { Blueprint } from '@lib';
import { FunctionComponent } from 'react';
import { InventoryBag } from './InventoryUI.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';

export const BlueprintBadge: FunctionComponent<{ blueprint: Blueprint | null }> = ({
	blueprint,
}) => {
	if (!blueprint) {
		return null;
	}
	return (
		<Table>
			<Row>
				<Cell>
					<InventoryBag stacks={blueprint.ingredients} />
				</Cell>
				<Cell style={{ textAlign: 'center' }}>
					{(blueprint.options.fullTimeEquivalent / 1000).toFixed(1)}
					<br />
					<svg xmlns="http://www.w3.org/2000/svg" width="80" height="29">
						<path d="m0,0h80v29H0" fill="#FFF" />
						<path d="m61,15H11v-1h49m0-2 9,2.5-9,2.5" />
					</svg>
				</Cell>
				<Cell>
					<InventoryBag stacks={blueprint.products} />
				</Cell>
			</Row>
		</Table>
	);
};
