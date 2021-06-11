import Color from 'color';
import { FunctionComponent } from 'react';
import { Anchor } from '../space/Anchor';
import { MonochromeBox } from '../space/MonochromeBox';
import { Viewport } from '../space/Viewport';
import { Backdrop } from './scaffolding';

const Demo: FunctionComponent = () => (
	<>
		<Backdrop>
			<Viewport zoom={1} center={{ x: 0.5, y: 0.5, z: 0.5 }}>
				<Anchor x={-2} y={-2} z={0}>
					<MonochromeBox />
				</Anchor>
				<Anchor x={0} y={0} z={0}>
					<MonochromeBox innerStroke={Color('#630a0a7d')} fill={Color('#960202')} />
				</Anchor>
				<Anchor x={2} y={2} z={0}>
					<MonochromeBox
						fill={Color('#ffffff7f')}
						onClick={() => window.alert('Clicky click!')}
					/>
				</Anchor>
			</Viewport>
		</Backdrop>
		<Backdrop>
			<Viewport center={{ x: 1, y: 0, z: 0.5 }}>
				<Anchor x={0} y={0} z={0}>
					<MonochromeBox />
				</Anchor>
				<Anchor x={1} y={0} z={0}>
					<MonochromeBox />
				</Anchor>
				<Anchor x={2} y={0} z={0}>
					<MonochromeBox />
				</Anchor>
				<Anchor x={2} y={-1} z={0}>
					<MonochromeBox />
				</Anchor>
			</Viewport>
		</Backdrop>
	</>
);

export default Demo;
