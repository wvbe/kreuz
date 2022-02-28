import Color from 'color';
import React, { FunctionComponent } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { Anchor } from '../space/Anchor';
import { SimpleCube } from '../space/SimpleCube';
import { EntityPersonI } from '../types';
import { PersonEntity } from './PersonEntity';

const zoom = 0.25;
const translate = zoom / 2;
const offset = new Coordinate(-translate, -translate, -translate / 2);

export class GuardEntity extends PersonEntity implements EntityPersonI {
	public get label(): string {
		return `Guardsman ${this.passport.firstName}`;
	}

	Component: FunctionComponent = () => {
		return (
			<Anchor {...offset}>
				<SimpleCube
					size={zoom}
					fill={Color('#227d5e')}
					stroke={Color('#227d5e').mix(Color('#000'), 0.3)}
					innerStroke={Color('#227d5e').mix(Color('#fff'), 0.3)}
				/>
			</Anchor>
		);
	};
}
