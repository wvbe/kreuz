import { create } from 'zustand';

export interface ModalData {
	id: string;
	component: React.ComponentType<any>;
	props: Record<string, any>;
	position?: { x: number; y: number };
	minimized?: boolean;
}

interface ModalState {
	modals: ModalData[];
	openModal: (modal: Omit<ModalData, 'id'>) => string;
	closeModal: (id: string) => void;
	updateModal: (id: string, updates: Partial<ModalData>) => void;
}

export const useModalStore = create<ModalState>((set) => ({
	modals: [],
	openModal: (modal) => {
		const id = Math.random().toString(36).substring(2);
		set((state) => ({
			modals: [...state.modals, { ...modal, id }],
		}));
		return id;
	},
	closeModal: (id) => {
		set((state) => ({
			modals: state.modals.filter((modal) => modal.id !== id),
		}));
	},
	updateModal: (id, updates) => {
		set((state) => ({
			modals: state.modals.map((modal) =>
				modal.id === id ? { ...modal, ...updates } : modal,
			),
		}));
	},
}));
