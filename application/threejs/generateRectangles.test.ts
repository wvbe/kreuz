import { expect, it, describe, run } from 'tincan';
import { RectangleParty } from './generateRectangles.ts';

it('generateRectangles', () => {
	expect(
		RectangleParty.init(['test'], 50, 50, {
			minimumBuildingLength: 20,
		}).flatten(),
	).toEqual([
		{
			x: 0,
			y: 0,
			w: 50,
			h: 17.83482779655932,
			parent: undefined,
			children: [],
		},
		{
			x: 0,
			y: 17.83482779655932,
			w: 31.19705432817692,
			h: 14.60922328976118,
			parent: undefined,
			children: [],
		},
		{
			x: 31.19705432817692,
			y: 17.83482779655932,
			w: 18.80294567182308,
			h: 14.60922328976118,
			parent: undefined,
			children: [],
		},
		{
			x: 0,
			y: 32.4440510863205,
			w: 50,
			h: 17.555948913679497,
			parent: undefined,
			children: [],
		},
	]);
});
run();
