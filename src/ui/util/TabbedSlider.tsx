import React, { useState } from 'react';
import styles from './TabbedSlider.module.css';

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
		<div className={styles['tabbed-slider']}>
			<div className={styles['tab-buttons']}>
				{tabs.map((tab: Tab, index: number) => (
					<button
						key={index}
						className={`${styles['tab-button']} ${
							index === activeIndex ? styles.active : ''
						}`}
						onClick={() => handleTabClick(index)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className={styles['tab-content']}>
				<div
					className={styles['tab-content-inner']}
					style={{
						transform: `translateX(-${activeIndex * 100}%)`,
					}}
				>
					{tabs.map((tab: Tab, index: number) => (
						<div key={index} className={styles['tab-panel']}>
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
