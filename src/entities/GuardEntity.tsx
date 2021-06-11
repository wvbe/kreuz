import Color from 'color';
import React, { FunctionComponent } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { Anchor } from '../space/Anchor';
import { MonochromeBox } from '../space/MonochromeBox';
import { Entity } from './Entity';

const zoom = 0.25;
const translate = zoom / 2;
const offset = new Coordinate(-translate, -translate, 0);

export class GuardEntity extends Entity {
	get label(): string {
		return `Guardsman ${this.id}`;
	}

	Component: FunctionComponent = () => {
		return (
			<Anchor {...offset}>
				<MonochromeBox size={zoom} fill={Color('#227d5e')} />
			</Anchor>
		);
	};
}
