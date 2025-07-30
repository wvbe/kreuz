import React from 'react';

import '../src/ui/hud/variables.css';
import './stories.css';
const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [
		(Story) => (
			<>
				<Story />
			</>
		),
	],
};

export default preview;
