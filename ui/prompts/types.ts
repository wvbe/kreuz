import { FC } from 'react';
import { Prompt } from '@lib';

export type PromptModal<PromptGeneric> = PromptGeneric extends Prompt<infer ReturnValue>
	? FC<{
			onSubmit(value: ReturnValue): void;
			onCancel(error?: Error): void;
	  }>
	: never;
