import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getMedalCount } from 'src/redux/selectors';
import { fetchMedalCount } from 'src/redux/actions';
import { isEmpty } from 'lodash';
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
	const { content: medalCount, loading: medalCountLoading } = useSelector(getMedalCount);

	if (isEmpty(medalCount) && !medalCountLoading) dispatch(fetchMedalCount());

	const [sortBy, setSortBy] = useState(null);

	const medalSortFunction = useCallback((a, b) => {
		if ( parseInt(a[sortBy.key]) < parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? -1 : 1;
		}
		if ( parseInt(a[sortBy.key]) > parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? 1 : -1;
		}
		return 0;
	}, [sortBy]);

	const sortedMedalCount = useMemo(() => {
		const medalCountCopy = [...medalCount];
		return sortBy === null ? medalCountCopy: [...medalCountCopy.sort(medalSortFunction)];
	}, [medalCount, medalSortFunction, sortBy]);

	const formatDriverName = (driver) => driver.split(' ')[0];

	const sortByKey = (key) => {
		if (sortBy?.key === key) {
			if (sortBy.direction === 'desc') return setSortBy({key, direction: 'asc'});
			if (sortBy.direction === 'asc') return setSortBy(null);
		}
		return setSortBy({key, direction: 'desc'});
	}

	const getSortIcon = (track) => {
		if (sortBy?.key !== track) return <i className="fa-solid fa-sort"></i>;
		if (sortBy?.direction === 'desc') return <i className="fa-solid fa-sort-down"></i>;
		if (sortBy?.direction === 'asc') return <i className="fa-solid fa-sort-up"></i>;
	};
	
	const renderTable = () => (
		<table>
			<thead>
				<tr>
					<th 
						className="medal-count__table-header"
					>
						Driver
					</th>
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
						onClick={() => sortByKey('Points')}
					>
						Points {getSortIcon('Points')}
					</th>
				</tr>
			</thead>
			<tbody>
				{sortedMedalCount.map(({ Driver, Gold, Silver, Bronze, Points }) => (
					<tr key={Driver} >
						<td className='medal-count__table-cell'><div>{Driver}</div></td>
						<td className='medal-count__table-cell'><div>{Gold}</div></td>
						<td className='medal-count__table-cell'><div>{Silver}</div></td>
						<td className='medal-count__table-cell'><div>{Bronze}</div></td>
						<td className='medal-count__table-cell'><div>{Points}</div></td>
					</tr>
				))}
			</tbody>
		</table>
	);

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
				<YAxis type="category" dataKey="Driver" tickFormatter={formatDriverName} interval={0} />
				<Bar dataKey="Gold" stackId="a" fill="#C9B037" />
				<Bar dataKey="Silver" stackId="a" fill="#B4B4B4" />
				<Bar dataKey="Bronze" stackId="a" fill="#AD8A56" />
				<ChartTooltip cursor={false} />

			</BarChart>
		</ResponsiveContainer >
	);

	const isDataReady = !isEmpty(medalCount) && !medalCountLoading;

	if (isDataReady) {
		return (
			<div className="medal-count">
				<h1 className="medal-count__title">League Leaders</h1>
				<div className="medal-count__table-container">
					{renderTable()}
				</div>

				<div className='medal-count__graph-container'>
					{renderGraph()}
				</div>
			</div>
		);
	}
}

export default MedalCount;
