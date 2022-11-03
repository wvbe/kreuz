import { type Game, type FactoryBuildingEntity } from '@lib';

type Result = {
	type: 'error' | 'warning';
	message: string;
};

function getGameAnalysis(game: Game) {
	const results: Result[] = [];

	const persons = game.entities.filter((e) => e.type === 'person');
	if (!persons.length) {
		results.push({ type: 'error', message: 'There are no living people in this world.' });
	}
	const factories = game.entities.filter<FactoryBuildingEntity>((e) => e.type === 'factory');
	if (!factories.length) {
		results.push({ type: 'error', message: 'There are no factories in this world. Without factories, you\'re not producing anything.' });
	}
	const factoriesWithBlueprints = factories.filter((factory) => factory.$blueprint.get());
	if (!factoriesWithBlueprints.length) {
		results.push({ type: 'error', message: 'There are no factories with a blueprint.' });
	}


	const marketStalls = game.entities.filter((e) => e.type === 'market-stall');
	const churches = game.entities.filter((e) => e.type === 'church');

	return results;
}
