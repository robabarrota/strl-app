import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getDriverStats, getRaceResults, getDriverPoints, getTrackList, getParticipants } from '@/redux/selectors';
import { fetchDriverStats, fetchRaceResults, fetchDriverPoints, fetchTrackList, fetchParticipants } from '@/redux/actions';
import { isEmpty, isNaN, last } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from '@/components/constructor-badge';
import useFormatDriverName from '@/hooks/useFormatDriverName';
import useFormatTrackName from '@/hooks/useFormatTrackName';
import useGraphTrackOrientation from '@/hooks/useGraphTrackOrientation';
import { round, getCarColor, tableSortFunction, nameSortFunction, cb } from '@/utils/utils';
import TableTooltip from '@/components/table-tooltip';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as ChartTooltip,
	Legend,
	ResponsiveContainer
} from "recharts";
import styled from 'styled-components';
import useSortInUrlParams from '@/hooks/useSortInUrlParams';

const blockName = 'driver-standings';
const bem = cb(blockName);

const statHeaders = [
	{key: 'total', label: 'TOTAL'},
	{key: 'averagePoints', label: 'AVG'},
	{key: 'racesMissed', label: 'DNS\'s'},
];

const LegendWrapper = styled.div`
	padding: 20px;
	padding-top: 30px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
`;

const LegendSpan = styled.span`
	background-color: ${props => props.$teamColor};
	padding: 1px 10px;
	border-radius: 12px;
	margin: 5px;
	color: none;
	white-space: nowrap;
	cursor: pointer;
`;

const defaultSortBy = {
	key: 'total',
	direction: 'desc'
};

const DriverStandings = ({show}) => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useSortInUrlParams(defaultSortBy);
	const [sortedDriverPoints, setSortedDriverPoints] = useState([]);
	const [sortedDriverStats, setSortedDriverStats] = useState([]);
	const formatDriverName = useFormatDriverName();
	const formatTrackName = useFormatTrackName();
	const graphTrackOrientation = useGraphTrackOrientation();

	const { content: driverStats, loading: driverStatsLoading, fetched: driverStatsFetched, error: driverStatsError } = useSelector(getDriverStats);
	const { content: raceResults, loading: raceResultsLoading, fetched: raceResultsFetched, error: raceResultsError } = useSelector(getRaceResults);
	const { content: driverPoints, loading: driverPointsLoading, fetched: driverPointsFetched, error: driverPointsError } = useSelector(getDriverPoints);
	const { content: trackList, loading: trackListLoading, fetched: trackListFetched, error: trackListError } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, fetched: participantsFetched, error: participantsError } = useSelector(getParticipants);

	if (!driverStatsFetched && !driverStatsLoading && !driverStatsError) dispatch(fetchDriverStats());
	if (!raceResultsFetched && !raceResultsLoading && !raceResultsError) dispatch(fetchRaceResults());
	if (!driverPointsFetched && !driverPointsLoading && !driverPointsError) dispatch(fetchDriverPoints());
	if (!trackListFetched && !trackListLoading && !trackListError) dispatch(fetchTrackList());
	if (!participantsFetched && !participantsLoading && !participantsError) dispatch(fetchParticipants());

	useEffect(() => {
		if (driverPoints.length && driverStats.length) {
			const driverPointsCopy = [...driverPoints];
			const statsCopy = [...driverStats];
			if (sortBy === null) {
				const sortedStats =  [...statsCopy.sort((a,b) => tableSortFunction(a, b, defaultSortBy))]
				setSortedDriverStats(sortedStats);
				const sortedDrivers = sortedStats.map(stat => stat.driver);
				setSortedDriverPoints([...driverPointsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
			}
			else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
				const sortedStats =  [...statsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))]
				setSortedDriverStats(sortedStats);
				const sortedDrivers = sortedStats.map(stat => stat.driver);
				setSortedDriverPoints([...driverPointsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
			}  else if(sortBy.key === 'driver'){
				const sortedStats =  [...statsCopy.sort((a,b) => nameSortFunction(a, b, sortBy))]
				setSortedDriverStats(sortedStats);
				const sortedDrivers = sortedStats.map(stat => stat.driver);
				setSortedDriverPoints([...driverPointsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
			} else {
				const sortedDriverPoints = [...driverPointsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))];
				setSortedDriverPoints(sortedDriverPoints);
				const sortedDrivers = sortedDriverPoints.map((raceResult) => raceResult.driver);
				setSortedDriverStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
			}
		}
	}, [driverPoints, sortBy, driverStats]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			trackList.map(({key}) => +row[key]).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [trackList, raceResults]);

	const data = useMemo(() => 
		trackList.reduce((acc, track) => {
			const trackScores = {
				name: formatTrackName(track.label)
			};
			driverPoints.forEach(row => {
				let result = row[track.key];
				const previousScore = last(acc)?.[row.driver] ?? 0;
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row.driver] = +result + previousScore;
			});
			acc.push(trackScores);
			return acc;
		}, [])
	, [trackList, driverPoints, formatTrackName])

	const getClassName = (header) => {
		if (header === 'Driver') return bem('driver');
		if (header === 'Car') return bem('car');
		return bem('track')
	};

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
		<div className={bem('end-subtable-container', 'left')}>
			<table>
				<thead>
					<tr>
						<th 
							className={`${bem('table-header')} ${bem('table-header', 'sortable')}`}
							onClick={() => sortByKey('driver')}
						>
							Driver {getSortIcon('driver')}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedDriverPoints.map((row) => (
						<tr key={row.driver}>
							<td className={bem('table-cell')}>
								<TableTooltip innerHtml={row.driver} customClass={bem('driver-label')}>
									{formatDriverName(row.driver)} <ConstructorBadge constructor={row.car} />
								</TableTooltip>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedDriverPoints, formatDriverName, sortByKey, getSortIcon]);

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className={bem('results-subtable-container')}>
				<table>
					<thead>
						<tr>
						{trackList.map(({label, key}) => 
							<th 
								key={label} 
								className={`${bem('table-header')} ${bem('table-header', 'sortable')}`} 
								onClick={() => sortByKey(key)}
							>
								{formatTrackName(label)} {getSortIcon(key)}
							</th>
						)}
						</tr>
					</thead>
					<tbody>
						{sortedDriverPoints.map((row) => (
							<tr key={row.driver}>
								{trackList.map(({key, label}, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`${bem('table-cell')} ${getClassName(key)}`}>
										<TableTooltip innerHtml={label}>
											{row[key]}
										</TableTooltip>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [trackList, formatTrackName, sortedDriverPoints, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => {
		const renderStatsSubTableData = () => 
			<table>
				<thead>
					<tr>
						{statHeaders.map((header) => 
							<th
								key={header.key}
								className={`${bem('table-header')} ${bem('table-header', 'sortable')}`}
								onClick={() => sortByKey(header.key)}
							>
								{header.label} {getSortIcon(header.key)}
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{sortedDriverStats.map((driverStats) => (
						<tr key={driverStats.driver} className={bem('row')} >
							{statHeaders.map((stat, index) =>
								<td
									key={`${driverStats.driver}-${index}`}
									className={bem('table-cell')}
								>
									<TableTooltip innerHtml={stat.label}>
										{round(driverStats[stat.key], {formatFn: stat.formatCallback})}
									</TableTooltip>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		;
		return (
			<div className={bem('end-subtable-container', 'right')}>
				<div 
					className={`${bem('toggle-stats')} ${showStats ? 'show' : ''}`} 
					onClick={() => setShowStats(current => !current)}
				>
					{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
					{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
				</div>
				{showStats && renderStatsSubTableData()}
			</div>
		);
	}, [sortedDriverStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? item.isPrimary ? 0.9 : 0.7 : graphFilter?.includes(item.driver) ? item.isPrimary ? 0.9 : 0.7 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => participants.map((row) => (
		<Line
			key={row.driver}
			type="monotone"
			dataKey={row.driver}
			stroke={getCarColor(row.car, row.isPrimary, getCustomLineOpacity(row))}
			connectNulls
			strokeWidth={getStrokeWidth(row.car)}
		/>
	));

	const customLegend = useCallback(({payload}) => {
		const toggleFilter = (item) => {
			const { dataKey } = item;
	
			const index = graphFilter.indexOf(dataKey);
			if (index > -1) {
				setGraphFilter(graphFilter.filter(key => key !== dataKey));
				return;
			}
			setGraphFilter((oldFilter) => [...oldFilter, dataKey]);
		};

		return (
			<LegendWrapper>
				{payload.map((entry, index) => (
					<LegendSpan $teamColor={entry.color} key={`item-${index}`} onClick={() => toggleFilter(entry)}>
						{formatDriverName(entry.value)}
					</LegendSpan>
				))}
			</LegendWrapper>
		)
	}, [formatDriverName, graphFilter]);

	const renderGraph = () => (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart
				width={500}
				height={300}
				data={data}
				margin={{
					top: 5,
					right: 30,
					left: 0,
					bottom: 5
				}}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" interval={0} angle={graphTrackOrientation} tickMargin={20} />
				<YAxis domain={['dataMin', 'dataMax']} interval={0} tickCount={lastPosition} />
				<ChartTooltip />
				<Legend content={customLegend} />
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
	);

	const isDataReady = (
		driverPointsFetched && !driverPointsLoading
		&& driverStatsFetched && !driverStatsLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return show && (
		<div className={blockName}>
			{isDataReady && (
				<>
					<div className={bem('table-container')}>
						{renderDriverSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className={bem('graph-container')}>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);
}

export default DriverStandings;
