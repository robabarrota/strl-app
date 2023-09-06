import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getMedalCount } from 'src/redux/selectors';
import { fetchMedalCount } from 'src/redux/actions';
import React, { useMemo, useState, useCallback } from 'react';

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as ChartTooltip,
	ResponsiveContainer
} from "recharts";

const MedalCount = () => {
	const dispatch = useDispatch();
	const { content: medalCount, loading: medalCountLoading, error: medalCountError, fetched: medalCountFetched } = useSelector(getMedalCount);

	if (!medalCountFetched && !medalCountLoading && !medalCountError) dispatch(fetchMedalCount());

	const [sortBy, setSortBy] = useState(null);

	const medalSortFunction = useCallback((a, b) => {
		if ( +a[sortBy.key] < +b[sortBy.key] ){
			return sortBy.direction === 'desc' ? -1 : 1;
		}
		if ( +a[sortBy.key] > +b[sortBy.key] ){
			return sortBy.direction === 'desc' ? 1 : -1;
		}
		return 0;
	}, [sortBy]);

	const sortedMedalCount = useMemo(() => {
		const medalCountCopy = [...medalCount];
		return sortBy === null ? medalCountCopy: [...medalCountCopy.sort(medalSortFunction)];
	}, [medalCount, medalSortFunction, sortBy]);

	const formatDriverName = useCallback((driver) => driver.split(' ')[0], []);

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
		<div className="medal-count__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th 
							className="medal-count__table-header"
						>
							Driver
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedMedalCount.map(({ driver }) => (
						<tr key={driver} >
							<td className='medal-count__table-cell'><div>{driver}</div></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedMedalCount]);

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className="medal-count__results-subtable-container">
				<table>
					<thead>
						<tr>
							<th 
								className="medal-count__table-header medal-count__table-header--sortable" 
								onClick={() => sortByKey('Gold')}
							>
								<i className="fa-solid fa-trophy medal-count__gold"></i> {getSortIcon('Gold')}
							</th>
							<th 
								className="medal-count__table-header medal-count__table-header--sortable" 
								onClick={() => sortByKey('Silver')}
							>
								<i className="fa-solid fa-trophy medal-count__silver"></i> {getSortIcon('Silver')}
							</th>
							<th 
								className="medal-count__table-header medal-count__table-header--sortable" 
								onClick={() => sortByKey('Bronze')}
							>
								<i className="fa-solid fa-trophy medal-count__bronze"></i> {getSortIcon('Bronze')}
							</th>
							<th 
								className="medal-count__table-header medal-count__table-header--sortable" 
								onClick={() => sortByKey('Cup')}
							>
								<i className="fa-solid fa-medal medal-count__cup"></i> {getSortIcon('Cup')}
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedMedalCount.map(({ driver, gold, silver, bronze, cup }) => (
							<tr key={driver} >
								<td className='medal-count__table-cell'><div>{gold}</div></td>
								<td className='medal-count__table-cell'><div>{silver}</div></td>
								<td className='medal-count__table-cell'><div>{bronze}</div></td>
								<td className='medal-count__table-cell'><div>{cup}</div></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [sortedMedalCount, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => (
		<div className="medal-count__end-subtable-container--right">
			<table>
				<thead>
					<tr>
						<th 
							className="medal-count__table-header medal-count__table-header--sortable" 
							onClick={() => sortByKey('Points')}
						>
							Points {getSortIcon('Points')}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedMedalCount.map(({ driver, points }) => (
						<tr key={driver} >
							<td className='medal-count__table-cell'><div>{points}</div></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedMedalCount, sortByKey, getSortIcon]);

	const renderGraph = () => (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart 
				width={500} 
				height={500} 
				data={medalCount}
				layout="vertical"
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 5
				}} 
				>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis type="number" interval={0} domain={['dataMin', 'dataMax']} tickMargin={0} minTickGap={0}/>
				<YAxis type="category" dataKey="driver" tickFormatter={formatDriverName} interval={0} />
				<Bar dataKey="gold" stackId="a" fill="#C9B037" />
				<Bar dataKey="silver" stackId="a" fill="#B4B4B4" />
				<Bar dataKey="bronze" stackId="a" fill="#AD8A56" />
				<Bar dataKey="cup" stackId="a" fill="#FFC107" />
				<ChartTooltip cursor={false} />

			</BarChart>
		</ResponsiveContainer >
	);

	const isDataReady = medalCountFetched && !medalCountLoading;

	if (isDataReady) {
		return (
			<div className="medal-count">
				<h1 className="medal-count__title">League Leaders</h1>
				<div className="medal-count__table-container">
					{renderDriverSubTable}
					{renderResultsSubTable}
					{renderStatsSubTable}
				</div>

				<div className='medal-count__graph-container'>
					{renderGraph()}
				</div>
			</div>
		);
	}
}

export default MedalCount;
