import styled from '@emotion/styled';

export const Backdrop = styled.div<{ height?: number }>`
	position: relative;
	height: ${({ height = 180 }) => `${height}px`};
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
`;
