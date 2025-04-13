import React, { FC, useEffect, useMemo, useState } from 'react';
import { Prompt } from '../../lib/level-1/classes/Prompt';
import { DriverI } from '../../lib/level-1/drivers/types';
import { useDriverContext } from '../context/DriverContext';
import { PromptModal } from '../prompts/types';

const registry = new Map<Prompt<any>, PromptModal<any>>();

export function registerUiForPrompt<Data extends { [key: string]: unknown }>(
	key: Prompt<Data>,
	ui: PromptModal<Prompt<Data>>,
) {
	registry.set(key, ui);
}

let identifier = 0;

type PromptData = DriverI['$prompt'] extends Event<infer T> ? T[0] : never;

export const ModalHost: FC = () => {
	const [prompts, setPrompts] = useState<PromptData[]>([]);
	const driver = useDriverContext();

	useEffect(() => {
		return driver.$prompt.on((prompt) => {
			setPrompts((prompts) => [...prompts, prompt]);
		});
	}, [driver]);

	const ui = useMemo(
		() =>
			prompts.map((prompt) => {
				const Component = registry.get(prompt.id);
				if (!Component) {
					debugger;
					throw new Error('Programmer error, UI for a prompt is not implemented');
				}
				const close = () => {
					setPrompts((prompts) => prompts.filter((p) => p !== prompt));
				};
				return (
					<div key={prompt.id.identifier}>
						<Component
							onSubmit={(data) => {
								close();
								prompt.resolve(data);
							}}
							onCancel={() => {
								close();
								prompt.reject();
							}}
						/>
					</div>
				);
			}),
		[prompts],
	);

	if (!ui.length) {
		return null;
	}

	return <div className='modal-backdrop'>{ui}</div>;
};
