import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getPenalties, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants, fetchPenalties } from 'src/redux/actions';
import { isEmpty, groupBy, first, last, isNaN } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import { pointMap, trackDetails } from 'src/utils/constants';
import { round, getCarColor, tableSortFunction } from 'src/utils/utils';
import TableTooltip from 'src/components/table-tooltip';
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
	{key: 'total', label: 'TOTAL'},
	{key: 'average', label: 'AVG'},
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
	background-color: ${props => props.teamColor};
	padding: 1px 10px;
	border-radius: 12px;
	margin: 5px;
	color: none;
	white-space: nowrap;
	cursor: pointer;
`;

const DriverStandings = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedDriverPoints, setSortedDriverPoints] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: raceResults, loading: raceResultsLoading, fetched: raceResultsFetched, error: raceResultsError } = useSelector(getRaceResults);
	const { content: fastestLaps, loading: fastestLapsLoading, fetched: fastestLapsFetched, error: fastestLapsError } = useSelector(getFastestLaps);
	const { content: penalties, loading: penaltiesLoading, fetched: penaltiesFetched, error: penaltiesError } = useSelector(getPenalties);
	const { content: trackList, loading: trackListLoading, fetched: trackListFetched, error: trackListError } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, fetched: participantsFetched, error: participantsError } = useSelector(getParticipants);

	if (!raceResultsFetched && !raceResultsLoading && !raceResultsError) dispatch(fetchRaceResults());
	if (!fastestLapsFetched && !fastestLapsLoading && !fastestLapsError) dispatch(fetchFastestLaps());
	if (!penaltiesFetched && !penaltiesLoading && !penaltiesError) dispatch(fetchPenalties());
	if (!trackListFetched && !trackListLoading && !trackListError) dispatch(fetchTrackList());
	if (!participantsFetched && !participantsLoading && !participantsError) dispatch(fetchParticipants());

	const resultHeaders = useMemo(() => trackList?.map(({ Track }) =>
		Track
	), [trackList]);

	const driverPoints = useMemo(() => {
		let results = []
		if (!isEmpty(resultHeaders) && raceResultsFetched && fastestLapsFetched && penaltiesFetched) {
			results = raceResults.map(row => {
				const driverName = row['Driver'];
				const driverPenalties = penalties.find(penaltyRow => penaltyRow['Driver'] === driverName);
				const pointsPerRace = {};
				resultHeaders.forEach(header => {
					let racePoints = pointMap[row[header]];
					if (racePoints !== undefined) {
						if (fastestLaps[header] === driverName && row[header] <= 10) racePoints += 1;
						const racePenalty = driverPenalties[header] ?? 0;
						racePoints -= racePenalty;
					} 
					
					pointsPerRace[header] = racePoints;
				});
				return  { 'Driver': driverName, 'Car': row['Car'], ...pointsPerRace };
			});
			penalties.filter(row => Object.keys(row).length > 2).forEach(penaltyRow => {
				resultHeaders.forEach(header => {
					let racePenalty = Number(penaltyRow[header]) ?? 0;
					const pointsBeforePenalty = results[header] ?? 0;
					results[header] = pointsBeforePenalty - racePenalty;
				});
			})
		}
		return results;
	}, [raceResults, resultHeaders, fastestLaps, penalties]);

	const formatDriverName = useCallback((driver) => !isMobile ? driver : driver.split(' ')[0], [isMobile]);
	const formatTrackName = useCallback((track) => !isMobile ? track : trackDetails[track]?.abbreviation, [isMobile]);

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(driverPoints, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalRaces = 0;
			const totalRacePoints = Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').reduce((acc, [track, points]) => {
				if (Number.isInteger(points)) acc += Number(points);
				return acc;
			}, 0);
			Object.entries(raceResults.filter((raceResult) => raceResult['Driver'] === driver)[0])
				.filter(([key, value]) => key !== 'Driver' && key !== 'Car')
				.forEach(([track, result]) => {
					if (result === 'DNS') racesMissed++;
					totalRaces++;
				});

			const average = totalRacePoints / totalRaces;

			return {
				driver,
				average: average === 0 ? '-' : average,
				total: totalRacePoints,
				racesMissed,
			}
		})
		return driverStats;
	}, [raceResults, driverPoints]);

	useEffect(() => {
		const driverPointsCopy = [...driverPoints];
		const statsCopy = [...stats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedDriverPoints(driverPointsCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedDriverPoints([...driverPointsCopy.sort((a, b) => sortedDrivers.indexOf(a['Driver']) - sortedDrivers.indexOf(b['Driver']))]);
		} else {
			const sortedDriverPoints = [...driverPointsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))];
			setSortedDriverPoints(sortedDriverPoints);
			const sortedDrivers = sortedDriverPoints.map((raceResult) => raceResult['Driver']);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [driverPoints, sortBy, stats]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			resultHeaders.map(track => parseInt(row[track])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [resultHeaders, raceResults]);

	const data = useMemo(() => 
		resultHeaders.reduce((acc, track) => {
			const trackScores = {
				name: formatTrackName(track)
			};
			driverPoints.forEach(row => {
				let result = row[track];
				const previousScore = last(acc)?.[row['Driver']] ?? 0;
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row['Driver']] = parseInt(result) + previousScore;
			});
			acc.push(trackScores);
			return acc;
		}, [])
	, [resultHeaders, driverPoints, formatTrackName])

	const graphTrackOrientation = useMemo(() => !isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'driver-standings__driver';
		if (header === 'Car') return 'driver-standings__car';
		return 'driver-standings__track'
	};

	const renderDriverSubTable = useMemo(() => (
		<div className="driver-standings__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="driver-standings__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{sortedDriverPoints.map((row) => (
						<tr key={row['Driver']}>
							<td className={`driver-standings__table-cell`}>
								<div className='driver-standings__driver-label'>
									{formatDriverName(row["Driver"])} <ConstructorBadge constructor={row["Car"]} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedDriverPoints, formatDriverName]);

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
		return (
			<div className="driver-standings__results-subtable-container">
				<table>
					<thead>
						<tr>
						{resultHeaders.map(header => 
							<th 
								key={header} 
								className="driver-standings__table-header driver-standings__table-header--sortable" 
								onClick={() => sortByKey(header)}
							>
								{formatTrackName(header)} {getSortIcon(header)}
							</th>
						)}
						</tr>
					</thead>
					<tbody>
						{sortedDriverPoints.map((row) => (
							<tr key={row['Driver']}>
								{resultHeaders.map((header, index) =>
									<td
										key={`${row['Driver']}-${index}`}
										className={`driver-standings__table-cell ${getClassName(header)}`}>
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
	}, [resultHeaders, formatTrackName, sortedDriverPoints, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => {
		const renderStatsSubTableData = () => 
			<table>
				<thead>
					<tr>
						{statHeaders.map((header) => 
							<th
								key={header.key}
								className="driver-standings__table-header driver-standings__table-header--sortable"
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
								className={`driver-standings__table-cell`}>
								{driverStats.total}
							</td>
							<td
								className={`driver-standings__table-cell`}>
								<TableTooltip innerHtml={round(driverStats.average, 8)}>
									{round(driverStats.average)}
								</TableTooltip>
							</td>
							<td
								className={`driver-standings__table-cell`}>
								{driverStats.racesMissed}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		;
		return (
			<div className="driver-standings__end-subtable-container--right">
				<div className={`driver-standings__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(current => !current)}>
					{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
					{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
				</div>
				{showStats && renderStatsSubTableData()}
			</div>
		);
	}, [sortedStats, showStats, sortByKey, getSortIcon]);

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
				<YAxis domain={['dataMin', 'dataMax']} interval={0} tickCount={lastPosition} />
				<ChartTooltip />
				<Legend content={customLegend} />
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
	);

	const isDataReady = (
		raceResultsFetched && !raceResultsLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return (
		<div className="driver-standings">
			<h1 className='driver-standings__title'>Driver Standings</h1>

			{isDataReady && (
				<>
					<div className="driver-standings__table-container">
						{renderDriverSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className='driver-standings__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default DriverStandings;
