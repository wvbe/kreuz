import { css } from '@emotion/react';
import Color from 'color';
import nebulaTexture from './textures/nebula-282c34.png';

export const color: Record<string, Color> = {};
color.white = Color('#fff');
color.terrain = Color('#282c34');
color.highlightedTerrain = color.terrain.lighten(1);

const styles = css`
	:root {
		/*
			Terrain with nothing special about it:
		*/
		--color-terrain-normal-fill: ${color.terrain.toString()};
		--color-terrain-highlight-outer-stroke: ${color.terrain
			.darken(0.3)
			.saturate(0.3)
			.toString()};
		--color-terrain-highlight-inner-stroke: ${color.terrain
			.lighten(0.4)
			.desaturate(0.8)
			.toString()};

		/*
			Terrain that is being hovered over with the mouse
		*/
		--color-terrain-highlight-fill: ${color.terrain.lighten(1).toString()};
		--color-terrain-highlight-outer-stroke: ${Color('#fff').toString()};
		--color-terrain-highlight-inner-stroke: ${color.terrain.mix(color.white, 0.3).toString()};
	}

	body {
		background: #282c34 url(${nebulaTexture});
	}

	p {
		margin: 0;
	}
`;

export default styles;
