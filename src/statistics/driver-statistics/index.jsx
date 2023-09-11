import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getDriverStats } from '@/redux/selectors';
import { fetchDriverStats } from '@/redux/actions';
import TableTooltip from '@/components/table-tooltip';
import { tableSortFunction } from '@/utils/utils';
import ConstructorBadge from '@/components/constructor-badge';

import { useMemo, useState, useCallback, useEffect } from 'react';
import useIsMobile from '@/hooks/useIsMobile';

const defaultSortBy = {
	key: 'total',
	direction: 'desc'
};

const statHeaders = [
	{key: 'total', label: 'POINTS'},
	{key: 'averageFinish', label: 'AVG FINISH'},
	{key: 'averagePoints', label: 'AVG POINTS'},
	{key: 'averageQualifying', label: 'AVG QUAL'},
	{key: 'averageDifference', label: 'AVG DIFF'},
	{key: 'dNFs', label: 'DNF\'s'},
	{key: 'fastestLaps', label: 'FASTEST'},
	{key: 'poles', label: 'POLES'},
	{key: 'racesMissed', label: 'DNS\'s'},
	{key: 'penalties', label: 'PENALTIES'},
];

const DriverStatistics = ({show}) => {
	const dispatch = useDispatch();
	const [sortedDriverStats, setSortedDriverStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: driverStats, loading: driverStatsLoading, error: driverStatsError, fetched: driverStatsFetched } = useSelector(getDriverStats);

	if (!driverStatsFetched && !driverStatsLoading && !driverStatsError) dispatch(fetchDriverStats());
		
	const [sortBy, setSortBy] = useState(null);

	useEffect(() => {
		const statsCopy = [...driverStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, defaultSortBy, ['averageFinish', 'averageQualifying']))];
			setSortedDriverStats(sortedStats);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, ['averageFinish', 'averageQualifying']))];
			setSortedDriverStats(sortedStats);
		}
	}, [driverStats, sortBy]);

	const formatDriverName = useCallback((driver) => !isMobile ? driver : driver.split(' ')[0], [isMobile])

	const sortByKey = useCallback((key) => {
		if (sortBy?.key === key) {
			if (sortBy.direction === 'desc') return setSortBy({key, direction: 'asc'});
			if (sortBy.direction === 'asc') return setSortBy(null);
		}
		return setSortBy({key, direction: 'desc'});
	}, [sortBy, setSortBy]);

	const getSortIcon = useCallback((track) => {
		if (sortBy?.key !== track) return <i className="fa-solid fa-sort"></i>;
		if (sortBy?.direction === 'desc') return <i className="fa-solid fa-sort-down"></i>;
		if (sortBy?.direction === 'asc') return <i className="fa-solid fa-sort-up"></i>;
	}, [sortBy]);

	const renderDriverSubTable = useMemo(() => (
		<div className="driver-statistics__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th 
							className="driver-statistics__table-header"
						>
							Driver
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedDriverStats.map((row) => (
						<tr key={row.driver} >
							<td className='driver-statistics__table-cell'>
								<div className='driver-statistics__driver-label'>
									{formatDriverName(row.driver)} <ConstructorBadge constructor={row.car} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedDriverStats, formatDriverName]);

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className="driver-statistics__results-subtable-container">
				<table>
					<thead>
						<tr>
							{statHeaders.map(stat => 
								<th 
									key={stat.key} 
									className="driver-statistics__table-header driver-statistics__table-header--sortable" 
									onClick={() => sortByKey(stat.key)}
								>
									{stat.label} {getSortIcon(stat.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedDriverStats.map((row) => (
							<tr key={row.driver}>
								{statHeaders.map((stat, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`driver-statistics__table-cell`}
									>
										<TableTooltip innerHtml={stat.label}>
											{row[stat.key]}
										</TableTooltip>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [sortedDriverStats, sortByKey, getSortIcon]);

	const isDataReady = driverStatsFetched && !driverStatsLoading;

	if (isDataReady) {
		return show && (
			<div className="driver-statistics">
				<div className="driver-statistics__table-container">
					{renderDriverSubTable}
					{renderResultsSubTable}
				</div>
			</div>
		);
	}
}

export default DriverStatistics;
