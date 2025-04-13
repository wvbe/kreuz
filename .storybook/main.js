/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
	stories: ['../stories/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		{
			name: '@storybook/addon-essentials',
			options: {
				docs: false,
			},
		},
		'@storybook/addon-onboarding',
		'@chromatic-com/storybook',
		'@storybook/experimental-addon-test',
	],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
};
export default config;
