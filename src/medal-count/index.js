import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getMedalCount } from 'src/redux/selectors';
import { fetchMedalCount } from 'src/redux/actions';
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import useIsMobile from 'src/hooks/useIsMobile';

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

	const isDataReady = useMemo(() => !(isEmpty(medalCount) || medalCountLoading),
		[medalCount, medalCountLoading])

	const isMobile = useIsMobile();

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const formatDriverName = (driver) => driver.split(' ')[0];

	const renderTable = () => (
		<table>
			<thead>
				<tr>
					<th className="medal-count__table-header">Driver</th>
					<th className="medal-count__table-header"><i className="fa-solid fa-trophy medal-count__gold"></i></th>
					<th className="medal-count__table-header"><i className="fa-solid fa-trophy medal-count__silver"></i></th>
					<th className="medal-count__table-header"><i className="fa-solid fa-trophy medal-count__bronze"></i></th>
					<th className="medal-count__table-header">Points</th>
				</tr>
			</thead>
			<tbody>
				{medalCount.map(({ Driver, Gold, Silver, Bronze, Points }) => (
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
