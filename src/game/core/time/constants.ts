/**
 * The ratios of years to months, months to days, days to hours, hours to minutes, minutes to seconds.
 */
const divisionsOfTime = [12, 30, 24, 60, 60, 1];

/**
 * The amounts of game time for a year, a month, a day, etc.
 */
const absoluteDivisionsOfTime = ((arr: number[]) => {
	const arr2: number[] = [];
	for (let i = arr.length - 1; i >= 0; i--) {
		let num = arr[i];
		for (let ii = i + 1; ii < arr.length; ii++) {
			num *= arr[ii];
		}
		arr2.unshift(num);
	}
	return arr2;
})(divisionsOfTime);

/**
 * SECOND:          1,
 * MINUTE:         60,
 * HOUR:        3_600,
 * DAY:        86_400,
 * MONTH:   2_592_000,
 * YEAR:   31_104_000
 */
export const [YEAR, MONTH, DAY, HOUR, MINUTE, SECOND] = absoluteDivisionsOfTime;
