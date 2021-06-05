import Generator from './Generator';

describe('Game from seeded dual mesh generator', () => {
	it('#serializeToSaveJson()', () => {
		const game = Generator.randomGame('test', {
			size: 5
		});
		expect(game.serializeToSaveJson()).toMatchInlineSnapshot();
	});
});
