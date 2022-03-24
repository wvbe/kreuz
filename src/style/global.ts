import { css } from '@emotion/react';
import Color from 'color';
import { activeUiPalette } from '../constants/palettes';

export default css`
	html,
	body,
	#root {
		height: 100%;
		width: 100%;
		padding: 0;
		margin: 0;
	}
	body {
		font-family: sans-serif;
		font-size: 14px;
		color: ${Color(activeUiPalette.text).toString()};
	}
	button,
	input {
		padding: 0;
		margin: 0;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
	}

	button {
	}
	a {
		text-decoration: none;
		color: ${activeUiPalette.hyperlink};
		&:hover {
			text-decoration: underline;
		}
	}
	p {
		margin: 0;
	}
`;
