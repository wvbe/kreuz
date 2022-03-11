import styled from '@emotion/styled';

export const Backdrop = styled.div<{ height?: number | string; padding?: number | string }>`
	position: relative;
	height: ${({ height }) =>
		height === undefined
			? 'auto'
			: typeof height === 'number'
			? `${height}px`
			: String(height)};
	padding: ${({ padding = '2em' }) =>
		typeof padding === 'number' ? `${padding}px` : String(padding)};
	background-image: linear-gradient(
		45deg,
		rgba(255, 255, 255, 0.02) 25%,
		rgba(0, 0, 0, 0.02) 25%,
		rgba(0, 0, 0, 0.02) 50%,
		rgba(255, 255, 255, 0.02) 50%,
		rgba(255, 255, 255, 0.02) 75%,
		rgba(0, 0, 0, 0.02) 75%,
		rgba(0, 0, 0, 0.02) 100%
	);
	background-size: 56.57px 56.57px;
	margin-bottom: 1em;
	box-sizing: border-box;
`;
