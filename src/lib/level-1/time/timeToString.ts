import { DAY, HOUR, MINUTE, MONTH, SECOND, YEAR } from './constants';
const parts = [YEAR, MONTH, DAY, HOUR, MINUTE, SECOND];
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
			value === 1
				? strings.push(`${value} ${labels[i]}`)
				: strings.push(`${value} ${labels[i]}s`);
			remainingTime -= value * part;
		}
	}
	return strings.join(' ');
}
