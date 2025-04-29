import React from 'react';

import '../src/ui2/hud/variables.css';

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
