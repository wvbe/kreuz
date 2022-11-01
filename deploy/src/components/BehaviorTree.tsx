import { type FunctionComponent } from 'react';
import { type BehaviorTreeNodeI } from '@lib';

const label: Record<string, string> = {
	sequence: '→',
	selector: '?',
};
const BehaviorTreeNode: FunctionComponent<{ node: BehaviorTreeNodeI }> = ({ node }) => {
	return (
		<div className="behavior-tree-node">
			<div className={`behavior-tree-node__label behavior-tree-node__label--${node.type}`}>
				{node.label ? <i>{node.label}</i> : label[node.type] || node.type}
			</div>
			{node.children && (
				<div className="behavior-tree-node__children">
					{node.children.map((child, index) => (
						<BehaviorTreeNode key={index} node={child} />
					))}
				</div>
			)}
		</div>
	);
};

export const BehaviorTree: FunctionComponent<{
	root: BehaviorTreeNodeI<Record<string, any>> | null;
}> = ({ root }) => {
	if (!root) {
		return <p>No behavior tree</p>;
	}
	return <BehaviorTreeNode node={root} />;
};
