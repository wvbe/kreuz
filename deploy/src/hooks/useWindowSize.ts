import { useEffect, useMemo, useState } from 'react';

export function useWindowSize() {
	const [memo, setMemo] = useState([self.innerWidth, self.innerHeight]);

	useEffect(() => {
		function update() {
			setMemo([self.innerWidth, self.innerHeight]);
		}
		self.addEventListener('resize', update);
		return () => {
			self.removeEventListener('resize', update);
		};
	}, []);

	return memo;
}
