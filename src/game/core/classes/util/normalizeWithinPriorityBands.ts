/**
 * Normalizes each score to between 0-1, coming from 0-n where n is the highest score
 * in that priority band
 *
 * @example
 * Score:        [0,   5, 10, 20,  10]
 * + Priority:   [1,   1,  1,  2,   2]
 * = Normalized: [0, 0.5,  1,  1, 0.5]
 */
export function normalizeWithinPriorityBands(
	scores: { priority: number; score: number }[],
): number[] {
	const maxScoresByPriority: Partial<Record<number, number>> = {};
	for (const { priority, score } of scores) {
		if (score > (maxScoresByPriority[priority] ?? 0)) {
			maxScoresByPriority[priority] = score;
		}
	}

	return scores.map(({ priority, score }) => {
		const maxForTier = maxScoresByPriority[priority];
		return maxForTier ? score / maxForTier : 0;
	});
}
