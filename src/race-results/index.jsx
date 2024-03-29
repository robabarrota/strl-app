import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getDriverStats, getTrackList, getParticipants } from '@/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchDriverStats, fetchTrackList, fetchParticipants } from '@/redux/actions';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from '@/components/constructor-badge';
import useFormatDriverName from '@/hooks/useFormatDriverName';
import useFormatTrackName from '@/hooks/useFormatTrackName';
import useGraphTrackOrientation from '@/hooks/useGraphTrackOrientation';
import { round, getCarColor, tableSortFunction, nameSortFunction, cb } from '@/utils/utils';
import TableTooltip from '@/components/table-tooltip';
import useSortInUrlParams from '@/hooks/useSortInUrlParams';

import { isNaN } from 'lodash';
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

const blockName = 'race-results';
const bem = cb(blockName);

const statHeaders = [
	{key: 'averageFinish', label: 'AVG'},
	{key: 'racesMissed', label: 'DNS\'s'},
	{key: 'fastestLaps', label: <i className="fa-solid fa-stopwatch race-results__fastest-icon"></i>},
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

const RaceResults = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortedRaceResults, setSortedRaceResults] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const formatDriverName = useFormatDriverName();
	const formatTrackName = useFormatTrackName();
	const graphTrackOrientation = useGraphTrackOrientation();
	const [sortBy, setSortBy] = useSortInUrlParams(defaultSortBy);

	const { content: raceResults, loading: raceResultsLoading, fetched: raceResultsFetched, error: raceResultsError } = useSelector(getRaceResults);
	const { content: driverStats, loading: driverStatsLoading, fetched: driverStatsFetched, error: driverStatsError } = useSelector(getDriverStats);
	const { content: fastestLaps, loading: fastestLapsLoading, fetched: fastestLapsFetched, error: fastestLapsError } = useSelector(getFastestLaps);
	const { content: trackList, loading: trackListLoading, fetched: trackListFetched, error: trackListError } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, fetched: participantsFetched, error: participantsError } = useSelector(getParticipants);

	useEffect(() => {
		if (!raceResultsFetched && !raceResultsLoading && !raceResultsError) {
			dispatch(fetchRaceResults());
		}
	}, [raceResultsFetched, raceResultsLoading, raceResultsError, dispatch]);
	useEffect(() => {
		if (!driverStatsFetched && !driverStatsLoading && !driverStatsError) {
			dispatch(fetchDriverStats());
		}
	}, [driverStatsFetched, driverStatsLoading, driverStatsError, dispatch]);
	useEffect(() => {
		if (!fastestLapsFetched && !fastestLapsLoading && !fastestLapsError) {
			dispatch(fetchFastestLaps());
		}
	}, [fastestLapsFetched, fastestLapsLoading, fastestLapsError, dispatch]);
	useEffect(() => {
		if (!trackListFetched && !trackListLoading && !trackListError) {
			dispatch(fetchTrackList());
		}
	}, [trackListFetched, trackListLoading, trackListError, dispatch]);
	useEffect(() => {
		if (!participantsFetched && !participantsLoading && !participantsError) {
			dispatch(fetchParticipants());
		}
	}, [participantsFetched, participantsLoading, participantsError, dispatch]);

	useEffect(() => {
		const raceResultsCopy = [...raceResults];
		const statsCopy = [...driverStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, defaultSortBy, ['averageFinish']))];
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedRaceResults([...raceResultsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, ['averageFinish']))];
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedRaceResults([...raceResultsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}  else if(sortBy.key === 'driver'){
			const sortedStats =  [...statsCopy.sort((a,b) => nameSortFunction(a, b, sortBy))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedRaceResults([...raceResultsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		} else {
			const sortedRaceResults = [...raceResultsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, 'all'))];
			setSortedRaceResults(sortedRaceResults);
			const sortedDrivers = sortedRaceResults.map((raceResult) => raceResult.driver);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [raceResults, sortBy, driverStats]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			trackList.map(({key}) => +row[key]).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [trackList, raceResults]);

	const data = useMemo(() => 
		trackList.map(track => {
			const trackScores = {
				name: formatTrackName(track.label)
			};
			raceResults.forEach(row => {
				let result = row[track.key];
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row.driver] = +result;
			});
			return trackScores;
		})
	, [trackList, raceResults, formatTrackName])

	const getClassName = (header) => {
		if (header === 'Driver') return bem('driver');
		if (header === 'Car') return bem('car');
		return bem('track');
	}

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
					{sortedRaceResults.map((row) => (
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
	), [sortedRaceResults, formatDriverName, sortByKey, getSortIcon]);

	const renderResultsSubTable = useMemo(() => {
		const fastestLapClass = (driverName, track) => {
			if (fastestLaps[track] === driverName && fastestLaps[track] !== undefined) return bem('fastest');
		};
		return (
			<div className={bem('results-subtable-container')}>
				<table>
					<thead>
						<tr>
							{trackList.map(track => 
								<th 
									key={track.key} 
									className={`${bem('table-header')} ${bem('table-header', 'sortable')}`}
									onClick={() => sortByKey(track.key)}
								>
									{formatTrackName(track.label)} {getSortIcon(track.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedRaceResults.map((row) => (
							<tr key={row.driver} className={bem('row')}>
								{trackList.map((track, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`${bem('table-cell')} ${getClassName(track.key)} ${fastestLapClass(row.driver, track.key)}`}>
											<TableTooltip innerHtml={track.label}>
												{row[track.key]}
											</TableTooltip>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [trackList, formatTrackName, sortedRaceResults, fastestLaps, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => (
		<div className={bem('end-subtable-container', 'right')}>
			<div 
				className={`${bem('toggle-stats')} ${showStats ? 'show' : ''}`} 
				onClick={() => setShowStats(!showStats)}
			>
				{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
				{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
			</div>
			{showStats && (
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
						
						{sortedStats.map((driverStats) => (
							<tr key={driverStats.driver}>
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
			)}
		</div>
	), [sortedStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? item.isPrimary ? 0.9 : 0.7 : graphFilter?.includes(item.driver) ? item.isPrimary ? 0.9 : 0.7 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => participants.map((row) => (
		<Line
			key={row.driver}
			type="monotone"
			dataKey={row.driver}
			stroke={getCarColor(row.car, row.isPrimary, getCustomLineOpacity(row))}
			connectNulls
			strokeWidth={getStrokeWidth(row.driver)}
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
				<YAxis reversed={true} domain={['dataMin', 'dataMax']} interval={0} tickCount={lastPosition} />
				<ChartTooltip />
				<Legend content={customLegend} />
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
	);

	const isDataReady = (
		raceResultsFetched && !raceResultsLoading
		&& fastestLapsFetched && !fastestLapsLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return (
		<div className={blockName}>
			<h1 className={bem('title')}>Race Results</h1>

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

export default RaceResults;
