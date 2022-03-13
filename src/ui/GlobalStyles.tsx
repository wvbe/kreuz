import { css, Global } from '@emotion/react';
import Color from 'color';
import React, { FunctionComponent } from 'react';
import { activeUiPalette } from '../constants/palettes';

// @TODO restore images some time
// import nebulaTexture from './textures/water-2.png';

const GlobalStyles = (
	(styles): FunctionComponent =>
	() =>
		<Global styles={styles} />
)(css`
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
		border: none;
		box-sizing: border-box;
		// Same as HorizontalLinkListItem
		padding: 0.5em 1em;
		white-space: nowrap;
		transition: background-color 0.5s;
		color: white;
		background-color: ${activeUiPalette.medium};
		border-top: 1px solid rgba(0, 0, 0, 0.2);
		&:hover {
			background-color: ${activeUiPalette.dark};
			color: ${activeUiPalette.hyperlink};
			cursor: pointer;
		}
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
`);

export default GlobalStyles;
