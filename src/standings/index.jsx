import './styles.scss';
import React, {useCallback, useMemo} from 'react';
import Tabs from '@/components/tabs';
import useTabsInUrlParams from '@/hooks/useTabsInUrlParams';
import DriverStandings from './driver-standings/index';
import ConstructorStandings from './constructor-standings/index';
import { cb } from '@/utils/utils';

const blockName = 'standings';
const bem = cb(blockName);

const tabs = [
	{
		label: 'Driver',
		icon: '/driver-icon.png',
	},
	{
		label: 'Constructor',
		icon: '/constructor-icon.png',
	},
];

const Standings = () => {
	const [activeTabIndex, setActiveTabIndex] = useTabsInUrlParams(tabs);
	const onChange = useCallback((index) => setActiveTabIndex(index), [setActiveTabIndex]);
	const renderDriverStandings = useMemo(() => <DriverStandings show={activeTabIndex === 0} />, [activeTabIndex]);
	const renderConstructorStandings = useMemo(() => <ConstructorStandings show={activeTabIndex === 1} />, [activeTabIndex]);

	return (
		<div className={blockName}>
			<div className={bem('title-container')}>
				<h1 className={bem('title')}>{tabs[activeTabIndex]?.label} Standings</h1>
				<Tabs tabs={tabs} activeTabIndex={activeTabIndex} onChange={onChange} />
			</div>

			{renderDriverStandings}
			{renderConstructorStandings}

		</div>
	);
}

export default Standings;
