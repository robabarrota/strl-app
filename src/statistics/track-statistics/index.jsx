import './styles.scss';
import { useSelector } from 'react-redux';
import { selectedDriverTrackStats } from '@/redux/selectors';
import TableTooltip from '@/components/table-tooltip';
import { tableSortFunction, round } from '@/utils/utils';
import { useMemo, useState, useCallback, useEffect } from 'react';
import useFormatDriverName from '@/hooks/useFormatDriverName';
import useSortInUrlParams from '@/hooks/useSortInUrlParams';

const defaultSortBy = {
	key: 'total',
	direction: 'desc'
};

const statHeaders = [
	{key: 'totalRaces', label: 'RACES'},
	{key: 'wins', label: 'WINS'},
	{key: 'averageFinish', label: 'AVG FINISHING POS'},
	{key: 'poles', label: 'POLES'},
	{key: 'averageQualifying', label: 'AVG QUALIFYING'},
	{key: 'totalDnfs', label: 'DNFS'},
	{key: 'finishRate', label: 'FINISH %', formatCallback: (value) => Number(value/100).toLocaleString(undefined,{style: 'percent'})},
	{key: 'fastestLaps', label: 'FASTEST LAPS'},
	{key: 'totalPenalties', label: 'PENALTIES'},
];

const reverseOrderStatKeys = ['averageFinish', 'averageQualifying'];

const TrackStatistics = ({show}) => {
	const [sortedTrackStats, setSortedTrackStats] = useState([]);
	const formatDriverName = useFormatDriverName();

	const driverStats = useSelector(selectedDriverTrackStats);
		
	const [sortBy, setSortBy] = useSortInUrlParams(defaultSortBy);

	useEffect(() => {
		const statsCopy = [...driverStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, defaultSortBy, reverseOrderStatKeys, reverseOrderStatKeys.includes(defaultSortBy.key)))];
			setSortedTrackStats(sortedStats);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, reverseOrderStatKeys, reverseOrderStatKeys.includes(sortBy.key)))];
			setSortedTrackStats(sortedStats);
		}
	}, [driverStats, sortBy]);

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
		<div className="track-statistics__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th 
							className="track-statistics__table-header"
						>
							Driver
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedTrackStats.map((row) => (
						<tr key={row.driver} >
							<td className='track-statistics__table-cell'>
								<TableTooltip innerHtml={row.driver} customClass='track-statistics__driver-label'>
									{formatDriverName(row.driver)}
								</TableTooltip>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedTrackStats, formatDriverName]);

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className="track-statistics__results-subtable-container">
				<table>
					<thead>
						<tr>
							{statHeaders.map(stat => 
								<th 
									key={stat.key} 
									className="track-statistics__table-header track-statistics__table-header--sortable" 
									onClick={() => sortByKey(stat.key)}
								>
									{stat.label} {getSortIcon(stat.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedTrackStats.map((row) => (
							<tr key={row.driver}>
								{statHeaders.map((stat, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`track-statistics__table-cell`}
									>
										<TableTooltip innerHtml={stat.label}>
											{round(row[stat.key], {formatFn: stat.formatCallback})}
										</TableTooltip>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [sortedTrackStats, sortByKey, getSortIcon]);

	const isDataReady = !!driverStats;

	if (isDataReady) {
		return show && (
			<div className="track-statistics">
				<div className="track-statistics__table-container">
					{renderDriverSubTable}
					{renderResultsSubTable}
				</div>
			</div>
		);
	}
}

export default TrackStatistics;
