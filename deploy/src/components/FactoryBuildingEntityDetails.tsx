import { FactoryBuildingEntity, ProductionJob } from '@lib';
import { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { FillBar } from './atoms/FillBar.tsx';
import { InventoryUI } from './IntentoryUI.tsx';


const ProductionJobDetails: FunctionComponent<{ job: ProductionJob }> = ({ job }) => {
	const blueprint = useEventedValue(job.$$blueprint);
	const progress = useEventedValue(job.$$progress);

	if (!blueprint) {
		return <p>No blueprint</p>;
	}
	return (
		<FillBar ratio={progress} label={'Production'} labelRight={`${Math.round(progress * 100)}%`} />
	);
};

export const FactoryBuildingEntityDetails: FunctionComponent<{ entity: FactoryBuildingEntity }> = ({
	entity,
}) => {
	const job = useEventedValue(entity.$$job);

	return (
		<article className="entity-details">
			{job && <ProductionJobDetails job={job as ProductionJob} />}
			<InventoryUI inventory={entity.inventory} />
		</article>
	);
};
