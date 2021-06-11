import React from 'react';

export type SvgMouseInteractionProps = Pick<
	React.SVGProps<SVGGElement>,
	'onClick' | 'onContextMenu' | 'onMouseEnter' | 'onMouseLeave'
>;
