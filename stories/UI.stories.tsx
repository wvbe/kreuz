import { Meta, Story } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity.ts';
import { GuardEntity } from '../src/entities/GuardPersonEntity.ts';
import { Tile } from '../src/terrain/Tile.ts';
import { JobI } from '../src/types.ts';
import { ActiveEntityOverlay } from '../src/react/ActiveEntityOverlay.ts';
import { Button } from '../src/react/components/Button.ts';
import { ContextMenu, ContextMenuFooter } from '../src/react/components/ContextMenu.ts';
import { Modal } from '../src/react/components/Modal.ts';
import { Backdrop, GlobalStyles } from './util.ts';
const meta: Meta = {
	title: 'UI',
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
};

export default meta;

class DemoJob implements JobI {
	label: string;
	constructor(label: string) {
		this.label = label;
	}
	start() {}
	destroy() {}
}

export const ui1: Story<{ seed: string }> = (args) => (
	<>
		<GlobalStyles />
		<Backdrop>
			<ActiveEntityOverlay />
		</Backdrop>
		<Backdrop>
			<ActiveEntityOverlay
				entity={(() => {
					const entity = new GuardEntity(args.seed, new Tile(0, 0, 0));
					entity.doJob(new DemoJob('Doing the rounds'));
					return entity;
				})()}
			/>
		</Backdrop>
		<Backdrop>
			<ActiveEntityOverlay
				entity={(() => {
					const entity = new CivilianEntity(args.seed, new Tile(0, 0, 0));
					entity.doJob(new DemoJob('Wandering around'));
					return entity;
				})()}
			/>
		</Backdrop>
	</>
);
ui1.storyName = '<ActiveEntityOverlay>';
ui1.args = {
	seed: 'test',
};

export const ui2: Story = (args) => (
	<Backdrop height={250}>
		<GlobalStyles />
		<div style={{ position: 'absolute', bottom: '1em', left: '50%' }}>
			<ContextMenu>
				<Button wide onClick={() => window.alert('You asked for it')}>
					Do something
				</Button>
				<Button wide>Don't something</Button>
				<Button wide>Don't something else</Button>
				<Button wide>Don't anything</Button>
				<Button wide>Don't all</Button>
				<ContextMenuFooter>What else?</ContextMenuFooter>
			</ContextMenu>
		</div>
	</Backdrop>
);
ui2.storyName = '<ContextMenu>';

export const Ui3: Story<{ buttonLabel: string }> = (args) => {
	const [clicks, setClicks] = useState(0);
	const click = useCallback(() => {
		setClicks(clicks + 1);
	}, [clicks]);
	return (
		<>
			<GlobalStyles />
			<p>Clicks: {clicks}.</p>
			<Backdrop>
				<Button onClick={click}>{args.buttonLabel || 'Normal button'}</Button>
			</Backdrop>
			<Backdrop>
				<Button onClick={click} wide>
					{args.buttonLabel || 'Wide button'}
				</Button>
			</Backdrop>
			<Backdrop>
				<Button onClick={click} active>
					{args.buttonLabel || 'Active button'}
				</Button>
			</Backdrop>
			<Backdrop>
				<Button onClick={click} disabled>
					{args.buttonLabel || 'Disabled button'}
				</Button>
			</Backdrop>
			<Backdrop>
				<Button onClick={click} active disabled>
					{args.buttonLabel || 'Active & disabled button'}
				</Button>
			</Backdrop>
		</>
	);
};
Ui3.storyName = '<Button>';
Ui3.args = {
	buttonLabel: '',
};

export const Ui4: Story = (args) => (
	<>
		<GlobalStyles />
		<Backdrop height={'100%'}>
			<Modal initialPosition={[100, 200]}>
				<p>Fucking hell</p>
			</Modal>
		</Backdrop>
	</>
);
Ui4.storyName = '<Modal>';
