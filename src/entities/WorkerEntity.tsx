import React, { FunctionComponent } from 'react';
import { Anchor } from '../space/Anchor';
import { Coordinate } from '../classes/Coordinate';
import { MonochromeTile } from '../space/MonochromeTile';
import { Entity } from './Entity';

const zoom = 0.5;
const translate = zoom / 2;
const offset = new Coordinate(-translate, -translate, 0);
export class WorkerEntity extends Entity {
	get label(): string {
		return `Worker ${this.id}`;
	}
	Component: FunctionComponent = () => {
		return (
			<Anchor {...offset}>
				<MonochromeTile zoom={zoom} />
			</Anchor>
		);
		// return <circle cx={x} cy={y} r="5" fill="white" />;
	};
}
