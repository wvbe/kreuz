// One year is 12 months
// One month is 30 days
// One day is 24 hours
// One hour is 60 minutes
// etc.
const parts = ((arr: number[]) => {
	const arr2: number[] = [];
	for (let i = arr.length - 1; i >= 0; i--) {
		let num = arr[i];
		for (let ii = i + 1; ii < arr.length; ii++) {
			num *= arr[ii];
		}
		arr2.unshift(num);
	}
	return arr2;
})([12, 30, 24, 60, 60, 1]);

const labels = ['year', 'month', 'day', 'hour', 'minute', 'second'];

export function timeToString(time: number): string {
	if (!time) {
		return 'no time';
	}
	let remainingTime = time;
	let strings: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const value = Math.floor(remainingTime / part);
		if (value >= 1) {
			value === 1 ? strings.push(`${value} ${labels[i]}`) : strings.push(`${value} ${labels[i]}s`);
			remainingTime -= value * part;
		}
	}
	return strings.join(' ');
}
