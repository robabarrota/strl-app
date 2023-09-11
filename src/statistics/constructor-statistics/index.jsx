import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getConstructorStats } from '@/redux/selectors';
import { fetchConstructorStats } from '@/redux/actions';
import TableTooltip from '@/components/table-tooltip';
import { tableSortFunction } from '@/utils/utils';
import {
	carAbbreviationMap,
} from '@/utils/constants';
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

const ConstructorStatistics = ({show}) => {
	const dispatch = useDispatch();
	const [sortedConstructorStats, setSortedConstructorStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: constructorStats, loading: constructorStatsLoading, error: constructorStatsError, fetched: constructorStatsFetched } = useSelector(getConstructorStats);

	if (!constructorStatsFetched && !constructorStatsLoading && !constructorStatsError) dispatch(fetchConstructorStats());
		
	const [sortBy, setSortBy] = useState(null);

	useEffect(() => {
		const statsCopy = [...constructorStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, defaultSortBy, ['averageFinish', 'averageQualifying']))];
			setSortedConstructorStats(sortedStats);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, ['averageFinish', 'averageQualifying']))];
			setSortedConstructorStats(sortedStats);
		}
	}, [constructorStats, sortBy]);

	const formatConstructorName = useCallback((constructor) => !isMobile ? constructor : carAbbreviationMap[constructor], [isMobile])

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

	const renderConstructorSubTable = useMemo(() => (
		<div className="constructor-statistics__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th 
							className="constructor-statistics__table-header"
						>
							Constructor
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedConstructorStats.map((row) => (
						<tr key={row.car} >
							<td className='constructor-statistics__table-cell'>
								<div className='constructor-statistics__driver-label'>
									{formatConstructorName(row.car)} <ConstructorBadge constructor={row.car} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedConstructorStats, formatConstructorName]);

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className="constructor-statistics__results-subtable-container">
				<table>
					<thead>
						<tr>
							{statHeaders.map(stat => 
								<th 
									key={stat.key} 
									className="constructor-statistics__table-header constructor-statistics__table-header--sortable" 
									onClick={() => sortByKey(stat.key)}
								>
									{stat.label} {getSortIcon(stat.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedConstructorStats.map((row) => (
							<tr key={row.car}>
								{statHeaders.map((stat, index) =>
									<td
										key={`${row.car}-${index}`}
										className={`constructor-statistics__table-cell`}
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
	}, [sortedConstructorStats, sortByKey, getSortIcon]);

	const isDataReady = constructorStatsFetched && !constructorStatsLoading;

	if (isDataReady) {
		return show && (
			<div className="constructor-statistics">
				<div className="constructor-statistics__table-container">
					{renderConstructorSubTable}
					{renderResultsSubTable}
				</div>
			</div>
		);
	}
}

export default ConstructorStatistics;
