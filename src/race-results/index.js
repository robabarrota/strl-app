import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import { trackDetails } from 'src/utils/constants';
import { round, getCarColor } from 'src/utils/utils';
import TableTooltip from 'src/components/table-tooltip';
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

const statHeaders = [
	{key: 'average', label: 'AVG'},
	{key: 'racesMissed', label: 'DNS\'s'},
	{key: 'fastestLapsCount', label: <i className="fa-solid fa-stopwatch race-results__fastest-icon"></i>},
];

const RaceResults = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedRaceResults, setSortedRaceResults] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: raceResults, loading: raceResultsLoading } = useSelector(getRaceResults);
	const { content: fastestLaps, loading: fastestLapsLoading } = useSelector(getFastestLaps);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(raceResults) && !raceResultsLoading) dispatch(fetchRaceResults());
	if (isEmpty(fastestLaps) && !fastestLapsLoading) dispatch(fetchFastestLaps());
	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading) dispatch(fetchParticipants());

	const trackSortFunction = useCallback((a, b) => {
		if (a[sortBy.key] === 'DNF' && b[sortBy.key] === 'DNS' ) return -1;
		if (a[sortBy.key] === 'DNS' && b[sortBy.key] === 'DNF') return  1;
		if (a[sortBy.key] === 'DNS') return 1;
		if (a[sortBy.key] === 'DNF') return 1;
		if (b[sortBy.key] === 'DNS') return -1;
		if (b[sortBy.key] === 'DNF') return -1;
		if ( parseInt(a[sortBy.key]) < parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? -1 : 1;
		}
		if ( parseInt(a[sortBy.key]) > parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? 1 : -1;
		}
		return 0;
	}, [sortBy]);

	const statSortFunction = useCallback((a, b) => {
		const getCorrectSortValue = (initialValue) => {
			let sortModifier = 1;
			sortModifier *= sortBy.direction === 'desc' ? -1 : 1;
			sortModifier *= sortBy.key === 'average' || sortBy.key === 'racesMissed' ? -1 : 1;

			return initialValue * sortModifier;
		};
		if (a[sortBy.key] === '-') return 1;
		if (b[sortBy.key] === '-') return -1;
		if ( a[sortBy.key] < b[sortBy.key] ){
			return getCorrectSortValue(-1);
		}
		if ( a[sortBy.key] > b[sortBy.key] ){
			return getCorrectSortValue(1);
		}
		return 0;
	}, [sortBy]);

	const formatDriverName = useCallback((driver) => isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => isMobile ? track : trackDetails[track]?.abbreviation, [isMobile])

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(raceResults, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalRaceFinish = 0;
			let totalRaces = 0;
			Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').forEach(([track, result]) => {
				if (result === 'DNS') racesMissed++;
				if (result === 'DNF') {
					const activeDrivers = raceResults.reduce((acc, raceResult) => {
						if (raceResult[track] !== 'DNS') acc++;
						return acc;
					}, 0);
					totalRaceFinish+= activeDrivers;
				}
				if (result !== 'DNF' && result !== 'DNS') totalRaceFinish += parseInt(result);
				totalRaces++;
			});
			
			const calculatedAverage = totalRaceFinish / (totalRaces - racesMissed);
			const average = isNaN(calculatedAverage) ? '-' : calculatedAverage;

			const fastestLapsCount = Object.values(fastestLaps).filter(fastestDriver => fastestDriver === driver).length;

			return {
				driver,
				average: average === 0 ? '-' : average,
				racesMissed, 
				fastestLapsCount,
			}
		})
		return driverStats;
	}, [raceResults, fastestLaps]);

	useEffect(() => {
		const raceResultsCopy = [...raceResults];
		const statsCopy = [...stats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedRaceResults(raceResultsCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort(statSortFunction)]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedRaceResults([...raceResultsCopy.sort((a, b) => sortedDrivers.indexOf(a['Driver']) - sortedDrivers.indexOf(b['Driver']))]);
		} else {
			const sortedRaceResults = [...raceResultsCopy.sort(trackSortFunction)];
			setSortedRaceResults(sortedRaceResults);
			const sortedDrivers = sortedRaceResults.map((raceResult) => raceResult['Driver']);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [raceResults, trackSortFunction, sortBy, statSortFunction, stats]);

	const resultHeaders = useMemo(() => trackList?.map(({Track}) =>
		Track
	), [trackList]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			resultHeaders.map(track => parseInt(row[track])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [resultHeaders, raceResults]);

	const data = useMemo(() => {
		return resultHeaders.map(track => {
			const trackScores = {
				name: formatTrackName(track)
			};
			raceResults.forEach(row => {
				let result = row[track];
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row['Driver']] = parseInt(result);
			});
			return trackScores;
		})
	}, [resultHeaders, raceResults, formatTrackName])

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'race-results__driver';
		if (header === 'Car') return 'race-results__car';
		return 'race-results__track'
	}

	const renderDriverSubTable = useMemo(() => (
		<div className="race-results__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="race-results__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{sortedRaceResults.map((row) => (
						<tr key={row['Driver']}>
							<td className={`race-results__table-cell`}>
								<div className='race-results__driver-label'>
									{formatDriverName(row["Driver"])} <ConstructorBadge constructor={row["Car"]} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedRaceResults, formatDriverName]);

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

	const renderResultsSubTable = useMemo(() => {
		const fastestLapClass = (driverName, track) => {
			if (fastestLaps[track] === driverName && fastestLaps[track] !== undefined) return 'race-results__fastest';
		};
		return (
			<div className="race-results__results-subtable-container">
				<table>
					<thead>
						<tr>
							{resultHeaders.map(header => 
								<th 
									key={header} 
									className="race-results__table-header race-results__table-header--sortable" 
									onClick={() => sortByKey(header)}
								>
									{formatTrackName(header)} {getSortIcon(header)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedRaceResults.map((row) => (
							<tr key={row['Driver']}>
								{resultHeaders.map((header, index) =>
									<td
										key={`${row['Driver']}-${index}`}
										className={`race-results__table-cell ${getClassName(header)} ${fastestLapClass(row['Driver'], header)}`}>
											<TableTooltip innerHtml={header}>
												{row[header]}
											</TableTooltip>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}, [resultHeaders, formatTrackName, sortedRaceResults, fastestLaps, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => (
		<div className="race-results__end-subtable-container--right">
			<div className={`race-results__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(!showStats)}>
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
									className="race-results__table-header race-results__table-header--sortable"
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
								<td
									className={`race-results__table-cell`}>
									<TableTooltip innerHtml={round(driverStats.average, 8)} hangLeft>
										{round(driverStats.average)}
									</TableTooltip>
								</td>
								<td
									className={`race-results__table-cell`}>
									{driverStats.racesMissed}
								</td>
								<td
									className={`race-results__table-cell`}>
									{driverStats.fastestLapsCount}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	), [sortedStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? item['Primary'] === 'TRUE' ? 0.9 : 0.7 : graphFilter?.includes(item['Driver']) ? item['Primary'] === 'TRUE' ? 0.9 : 0.7 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => participants.map((row) => (
		<Line
			key={row["Driver"]}
			type="monotone"
			dataKey={row["Driver"]}
			stroke={getCarColor(row['Car'], row['Primary'] === 'TRUE', getCustomLineOpacity(row))}
			connectNulls
			strokeWidth={getStrokeWidth(row['Driver'])}
		/>
	));

	const LegendWrapper = styled.div`
		padding: 20px;
		padding-top: 30px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	`;

	const LegendSpan = styled.span`
		background-color: ${props => props.teamColor};
		padding: 1px 10px;
		border-radius: 12px;
		margin: 5px;
		color: none;
		white-space: nowrap;
		cursor: pointer;
	`;

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
					<LegendSpan teamColor={entry.color} key={`item-${index}`} onClick={() => toggleFilter(entry)}>
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
		!isEmpty(sortedRaceResults) && !raceResultsLoading
		&& !isEmpty(fastestLaps) && !fastestLapsLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return (
		<div className="race-results">
			<h1 className='race-results__title'>Race Results</h1>

			{isDataReady && (
				<>
					<div className="race-results__table-container">
						{renderDriverSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className='race-results__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default RaceResults;
