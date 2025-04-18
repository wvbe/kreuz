import { PanZoomable } from './PanZoomable';

export default {
	title: 'UI/PanZoomable',
	component: PanZoomable,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
};

export const Default = {
	args: {
		children: (
			<div
				style={{
					position: 'relative',
					width: '200px',
					height: '200px',
					background: 'linear-gradient(45deg, #333, #666)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						color: 'white',
					}}
				>
					Pan and zoom this content
				</div>
			</div>
		),
	},
};
