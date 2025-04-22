import React, { useState } from 'react';
import './TabbedSlider.css';

export interface Tab {
	label: string;
	Content: React.FC<{ isActive: boolean; isVisible: boolean }>;
}

interface TabbedSliderProps {
	tabs: Tab[];
}

export type { TabbedSliderProps };

const TabbedSlider: React.FC<TabbedSliderProps> = ({ tabs }) => {
	const [activeIndex, setActiveIndex] = useState<number>(0);

	const handleTabClick = (index: number) => {
		setActiveIndex(index);
	};

	return (
		<div className='tabbed-slider'>
			<div className='tab-buttons'>
				{tabs.map((tab: Tab, index: number) => (
					<button
						key={index}
						className={`tab-button ${index === activeIndex ? 'active' : ''}`}
						onClick={() => handleTabClick(index)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className='tab-content'>
				<div
					className='tab-content-inner'
					style={{
						transform: `translateX(-${activeIndex * 100}%)`,
					}}
				>
					{tabs.map((tab: Tab, index: number) => (
						<div key={index} className='tab-panel'>
							<tab.Content
								isActive={index === activeIndex}
								isVisible={Math.abs(index - activeIndex) <= 1}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TabbedSlider;
