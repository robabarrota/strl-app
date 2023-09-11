import './styles.scss';
import React, {useCallback, useState, useMemo} from 'react';
import Tabs from '@/components/tabs';
import DriverStatistics from './driver-statistics/index';
import ConstructorStatistics from './constructor-statistics';

const tabs = [
	'Driver',
	'Constructor',
];

const Statistics = () => {
	const [activeTabIndex, setActiveTabIndex] = useState(0);
	const onChange = useCallback((index) => setActiveTabIndex(index), [setActiveTabIndex]);
	const renderDriverStandings = useMemo(() => <DriverStatistics show={activeTabIndex === 0} />, [activeTabIndex]);
	const renderConstructorStandings = useMemo(() => <ConstructorStatistics show={activeTabIndex === 1} />, [activeTabIndex]);

	return (
		<div className="statistics">
			<div className='statistics__title-container'>
				<h1 className='statistics__title'>{tabs[activeTabIndex]} Statistics</h1>
				<Tabs tabs={tabs} activeTabIndex={activeTabIndex} onChange={onChange} />
			</div>

			{renderDriverStandings}
			{renderConstructorStandings}
		</div>
	);
}

export default Statistics;
