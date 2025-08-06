import Game from '../../game/core/Game';
import { ButtonProps } from '../hud/atoms/Button';

export type Action = Pick<ButtonProps, 'icon'> & {
	label?: string;
	onClick: (game: Game) => Promise<void>;
};
