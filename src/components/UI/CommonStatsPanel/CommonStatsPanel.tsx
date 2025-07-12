import { nanoid } from 'nanoid';
import { memo } from 'react';
import styles from './CommonStatsPanel.module.scss';

interface Pair {
	key: string;
	value: string;
}

interface CommonStatsPanelProps {
	pairs: Pair[];
	className?: string;
}

function StatsItem({ pair }: { pair: Pair }) {
	return (
		<div className={styles['stats-panel__item']}>
			<div className={styles['stats-panel__item-top']}>
				<p>{pair.key}</p>
			</div>
			<div className={styles['stats-panel__item-bottom']}>
				<h4>{pair.value}</h4>
			</div>
		</div>
	);
}

const CommonStatsPanel = memo(({ pairs, className }: CommonStatsPanelProps) => {
	return (
		<div className={`${styles['stats-panel']} ${className || ''}`}>
			{pairs.map((pair) => (
				<StatsItem key={nanoid()} pair={pair} />
			))}
		</div>
	);
});

CommonStatsPanel.displayName = 'CommonStatsPanel';

export default CommonStatsPanel;
