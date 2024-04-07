import { DEFAULT_ASSETS } from '@lib';

function num(num: number) {
	return String(num).replace('.', ',');
}
function normalize(value: number | string) {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number') {
		return Math.round(value * 100) / 100;
	}
}
console.table(
	DEFAULT_ASSETS.materials
		.toArray()
		.map(({ symbol, ...item }) => ({
			...item,
			'$/stack': item.value * item.stack,
			'hydration/$': item.hydration / item.value,
			'nutrition/$': item.nutrition / item.value,
		}))
		.map((obj) =>
			Object.entries(obj).reduce(
				(acc, [key, value]) => ({
					...acc,
					[key]: normalize(value),
				}),
				{},
			),
		),
);
// console.log(['label', 'symbol', 'stack', 'value', 'hydration', 'nutrition', 'toxicity'].join('\t'));
// for (const item of ) {
// 		[
// 			item.label,
// 			item.symbol,
// 			item.stack,
// 			num(item.value),
// 			num(item.hydration),
// 			num(item.nutrition),
// 			num(item.toxicity),
// 		].join('\t'),
// 	);
// }
