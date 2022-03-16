import { css } from '@emotion/react';
import { activeUiPalette } from '../constants/palettes';

// https://codepen.io/devstreak/pen/dMYgeO
export const PRETTY_SCROLLBAR = css`
	&::-webkit-scrollbar-track {
		background-color: transparent;
	}

	&::-webkit-scrollbar {
		width: 12px;
		background-color: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${activeUiPalette.darkest};
	}
`;
