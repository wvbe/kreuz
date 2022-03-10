import { create } from '@storybook/theming';

import { addons } from '@storybook/addons';

addons.setConfig({});

addons.setConfig({
	isFullscreen: false,
	showNav: true,
	showPanel: false,
	panelPosition: 'bottom',
	enableShortcuts: true,
	isToolshown: true,
	theme: create({
		base: 'light',
		brandTitle: 'Kreuzzeug im Nagelhosen',
		brandUrl: 'https://github.com/wvbe/kreuzzeug-im-nagelhosen',
		brandImage: false
	}),
	selectedPanel: undefined,
	initialActive: 'sidebar',
	sidebar: {
		showRoots: true,
		collapsedRoots: ['other']
	},
	toolbar: {
		title: { hidden: false },
		zoom: { hidden: false },
		eject: { hidden: false },
		copy: { hidden: false },
		fullscreen: { hidden: false }
	}
});
