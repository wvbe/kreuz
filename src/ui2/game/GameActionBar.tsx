import React from 'react';
import { Button } from '../hud/atoms/Button';
import { Panel } from '../hud/atoms/Panel';

export const GameActionBar = () => {
	return (
		<Panel data-component='GameActionBar'>
			<Button icon='🔍' layout='tile' />
		</Panel>
	);
};
