import './styles.scss';
import { useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getArchives, getSelectedSeason, getDriverTrackStats, getSelectedTrack, getAllTracks } from '@/redux/selectors';
import { fetchArchives, setSelectedSeason, fetchDriverTrackStats, setSelectedTrack } from '@/redux/actions';
import Tabs from '@/components/tabs';
import DriverStatistics from './driver-statistics/index';
import ConstructorStatistics from './constructor-statistics';
import DropdownSelect from '@/components/dropdown-select';
import TrackStatistics from './track-statistics';

const tabs = [
	'Driver',
	'Constructor',
	'Track',
];

const Statistics = () => {
	const dispatch = useDispatch();
	const [activeTabIndex, setActiveTabIndex] = useState(0);
	
	const { content: archives, loading: archivesLoading, error: archivesError, fetched: archivesFetched } = useSelector(getArchives);
	const { loading: driverTrackStatsLoading, error: driverTrackStatsError, fetched: driverTrackStatsFetched } = useSelector(getDriverTrackStats);
	if (!archivesFetched && !archivesLoading && !archivesError) dispatch(fetchArchives());
	if (!driverTrackStatsFetched && !driverTrackStatsLoading && !driverTrackStatsError) dispatch(fetchDriverTrackStats());

	const { content: selectedSeason } = useSelector(getSelectedSeason);
	const { content: selectedTrack } = useSelector(getSelectedTrack);
	const { content: allTracks } = useSelector(getAllTracks);
	
	const onTabChange = useCallback((index) => setActiveTabIndex(index), [setActiveTabIndex]);

	const onSeasonSelect = useCallback(({value}) => value && dispatch(setSelectedSeason(value)), [dispatch]);
	const onTrackSelect = useCallback((value) => value && dispatch(setSelectedTrack(value)), [dispatch]);
	
	const seasonDropdownOptions = useMemo(() => 
		archives
			.map(({season}) => ({label: `Season ${+season}`, value: +season}))
			.sort((a, b) => b.value - a.value),
		[archives]
	);
	
	const selectedSeasonValue = useMemo(() => seasonDropdownOptions.find(({value}) => value === selectedSeason) || seasonDropdownOptions[0], [seasonDropdownOptions, selectedSeason]);

	const renderDriverStatistics = useMemo(() => <DriverStatistics show={activeTabIndex === 0}/>, [activeTabIndex]);
	const renderConstructorStatistics = useMemo(() => <ConstructorStatistics show={activeTabIndex === 1}/>, [activeTabIndex]);
	const renderTrackStatistics = useMemo(() => <TrackStatistics show={activeTabIndex === 2}/>, [activeTabIndex]);

	return (
		<div className="statistics">
			<div className='statistics__title-container'>
				<h1 className='statistics__title'>{tabs[activeTabIndex]} Statistics</h1>
				<div className='statistics__filter-bar'>
					<Tabs tabs={tabs} activeTabIndex={activeTabIndex} onChange={onTabChange} />
					{activeTabIndex < 2 && 
						<DropdownSelect 
							isLoading={!seasonDropdownOptions.length}
							options={seasonDropdownOptions || []}
							value={selectedSeasonValue}
							onChange={onSeasonSelect}
							color="#e10600"
							required
						/>
					}
					{activeTabIndex === 2 && 
						<DropdownSelect 
							isLoading={!allTracks.length}
							options={allTracks || []}
							value={selectedTrack}
							onChange={onTrackSelect}
							color="#e10600"
							required
						/>
					}

				</div>
			</div>

			{renderDriverStatistics}
			{renderConstructorStatistics}
			{renderTrackStatistics}
		</div>
	);
}

export default Statistics;
