import Color from 'color';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const marineColors = {
	/*
	 * https://color.adobe.com/nl/22:38-color-theme-1309691/
	 * <palette>
	 *   <color name="22:38-1" rgb="10454F" r="16" g="69" b="79" />
	 *   <color name="22:38-2" rgb="506266" r="79" g="98" b="102" />
	 *   <color name="22:38-3" rgb="818274" r="128" g="130" b="116" />
	 *   <color name="22:38-4" rgb="A3AB78" r="163" g="170" b="119" />
	 *   <color name="22:38-5" rgb="BDE038" r="189" g="224" b="55" />
	 * </palette>
	 */
	darkest: 0x10454f,
	dark: 0x506266,
	medium: 0x818274,
	light: 0xa3ab78,
	lightest: 0xbde038
};

const storybookColors = {
	darkest: 0x000000,
	dark: 0x333333, // the normal story background color, in "dark" SB themes
	medium: 0x444444, // a little darker than normal text color in storybook toolbar
	light: 0x1ea7fd, // brand color in storybook toolbar
	lightest: 0xffffff // hyperlinks in storybook nav
};

export const activePalette = storybookColors;

export const activeUiPalette = {
	darkest: 'rgba(30,30,30,0.9)',
	dark: 'rgba(30,30,30,0.6)',
	medium: 'rgba(30,30,30,0.4)',
	light: 'rgba(30,30,30,0.2)',
	lightest: 'rgba(30,30,30,0.1)',

	hyperlink: Color(activePalette.light).toString(),
	text: Color(activePalette.lightest).toString()
};
