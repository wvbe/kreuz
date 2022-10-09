// Additional styles apply on <button>

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ComponentType, FunctionComponent } from 'react';
import { activeUiPalette } from '../../constants/palettes.ts';
import { BLURRY_BACKGROUND } from '../../style/mixins.ts';

// @see src/react/GlobalStyles.tsx
const InnerButton = styled.button<{ active?: boolean; disabled?: boolean }>`
	color: white;
	text-align: left;
	white-space: nowrap;

	box-sizing: border-box;
	padding: 0.5em 1em;
	border: none;
	border-top: 1px solid rgba(0, 0, 0, 0.2);

	background-color: ${({ active }) => (active ? activeUiPalette.darkest : activeUiPalette.medium)};
	${BLURRY_BACKGROUND};
	transition: background-color 0.5s;

	${({ disabled }) =>
		disabled
			? css`
					color: ${activeUiPalette.darkest};
					background-color: ${activeUiPalette.lightest};
			  `
			: css`
					cursor: pointer;
					&:hover {
						background-color: ${activeUiPalette.dark};
						color: ${activeUiPalette.hyperlink};
					}
			  `};
`;

const InnerButtonWide = styled(InnerButton)`
	display: block;
	width: 100%;
`;

export const Button: FunctionComponent<
	{
		icon?: IconDefinition;
		wide?: boolean;
		active?: boolean;
		disabled?: boolean;
	} & (typeof InnerButton extends ComponentType<infer P> ? P : never)
> = ({ children, active, disabled, icon, wide, ...rest }) => {
	let Component = wide ? InnerButtonWide : InnerButton;
	return (
		<Component active={active} disabled={disabled} {...rest}>
			{icon && <FontAwesomeIcon icon={icon} />}
			{children}
		</Component>
	);
};
