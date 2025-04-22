import React, { FunctionComponent, useState } from 'react';
import './ContextMenu.css';

// Define the typesC for the sections and items
export type ContextMenuSection = { header: React.ReactNode; items: Item[] };
export type Item = { label: string } & (
	| { onClick: () => void; children?: undefined }
	| { onClick?: undefined; children: Item[] }
);

const ContextMenuItems: FunctionComponent<{ items: Item[] }> = ({ items }) => {
	const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);

	return (
		<ul className='context-menu__items'>
			{items.map((item, itemIndex) => (
				<li
					key={itemIndex}
					className='context-menu__item'
					onMouseEnter={() => setActiveSubMenu(item.children ? itemIndex : null)}
					onMouseLeave={() => setActiveSubMenu(null)}
					onClick={item.onClick}
				>
					<div className='context-menu__item__label'>{item.label}</div>
					{item.children ? (
						<div className='context-menu__item__children'>{'>'}</div>
					) : null}
					{item.children && activeSubMenu === itemIndex && (
						<ul className='context-menu__submenu'>
							<ContextMenuItems items={item.children} />
						</ul>
					)}
				</li>
			))}
		</ul>
	);
};
export const ContextMenu: FunctionComponent<{ sections: ContextMenuSection[] }> = ({
	sections,
}) => {
	return (
		<div className='context-menu'>
			{sections.map((section, sectionIndex) => (
				<div key={sectionIndex} className='context-menu__section'>
					<div className='context-menu__header'>{section.header}</div>
					<ContextMenuItems items={section.items} />
				</div>
			))}
		</div>
	);
};

// Basic styling for the context menu
// You can expand this with more detailed styles as needed
