import { useCallback } from 'react';

import { PROMPT_CONSTRUCTION_JOB } from '../../lib/level-2/construction/job';
import { Modal } from '../modals/Modal';
import { PromptModal } from './types';

export const EntityConstructionModal: PromptModal<typeof PROMPT_CONSTRUCTION_JOB> = ({
	onCancel,
	onSubmit: submitModalValue,
}) => {
	const onSubmit = useCallback(() => {
		submitModalValue({ derp: true });
	}, [submitModalValue]);
	return (
		<Modal onCancel={onCancel} onSubmit={onSubmit} title='What are we building today?'>
			<p>This is a test</p>
		</Modal>
	);
};
