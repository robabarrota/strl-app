import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first, last, isNaN } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import constants from 'src/utils/constants';
import Tooltip from 'src/components/tooltip';
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

const DriverStandings = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const { width } = useWindowDimensions();

	const { content: raceResults, loading: raceResultsLoading } = useSelector(getRaceResults);
	const { content: fastestLaps, loading: fastestLapsLoading } = useSelector(getFastestLaps);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(raceResults) && !raceResultsLoading) dispatch(fetchRaceResults());
	if (isEmpty(fastestLaps) && !fastestLapsLoading) dispatch(fetchFastestLaps());
	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading) dispatch(fetchParticipants());

	const isDataReady = useMemo(() =>
		!(isEmpty(raceResults) || raceResultsLoading
			|| isEmpty(trackList) || trackListLoading
			|| isEmpty(participants) || participantsLoading),
		[raceResults, raceResultsLoading, trackList, trackListLoading, participants, participantsLoading])

	const formatDriverName = useCallback((driver) => width > 820 ? driver : driver.split(' ')[0], [width])
	const formatTrackName = useCallback((track) => width > 820 ? track : constants.trackAbbreviationMap[track], [width])

	const resultHeaders = useMemo(() => trackList?.map(({ Track }) =>
		Track
	), [trackList]);

	const driverPoints = useMemo(() => raceResults.map(row => {
		const driver = { 'Driver': row['Driver'] };
		resultHeaders.forEach(header => {
			let racePoints = constants.pointMap[row[header]];
			if (racePoints && fastestLaps[header] === driver['Driver'] && row[header] <= 10) racePoints += 1;
			driver[header] = racePoints;
		});
		return driver;
	}), [raceResults, resultHeaders, fastestLaps]);

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(raceResults, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalRaces = 0;
			Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').forEach(([track, result]) => {
				if (result === 'DNS') racesMissed++;
				totalRaces++;
			});
			const totalRacePoints = Object.entries(driverPoints.filter((driverPoint) => driverPoint['Driver'] === driver)[0])
				.filter(([key, value]) => key !== 'Driver')
				.reduce((acc, [track, points]) => {
					if (Number.isInteger(points)) acc += Number(points);
					return acc;
			}, 0)

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
	, [resultHeaders, raceResults, formatTrackName])

	const graphTrackOrientation = useMemo(() => width > 820 ? 0 : 270, [width]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'race-results__driver';
		if (header === 'Car') return 'race-results__car';
		return 'race-results__track'
	}
	const renderDriverSubTable = () => (
		<div className="race-results__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="race-results__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{participants.map((row) => (
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
	);

	const renderResultsSubTable = () => (
		<div className="race-results__results-subtable-container">
			<table>
				<thead>
					<tr>
						{resultHeaders.map(header => <th key={header} className="race-results__table-header">{formatTrackName(header)}</th>)}
					</tr>
				</thead>
				<tbody>
					{driverPoints.map((row) => (
						<tr key={row['Driver']}>
							{resultHeaders.map((header, index) =>
								<td
									key={`${row['Driver']}-${index}`}
									className={`race-results__table-cell ${getClassName(header)}`}>
									<Tooltip innerHtml={header}>
										{row[header]}
									</Tooltip>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	const renderStatsSubTableData = useCallback(() => 
		<table>
			<thead>
				<tr>
					<th className="race-results__table-header">TOTAL</th>
					<th className="race-results__table-header">AVG</th>
					<th className="race-results__table-header">DNS's</th>
				</tr>
			</thead>
			<tbody>
				{stats.map((driverStats) => (
					<tr key={driverStats.driver}>
						<td
							className={`race-results__table-cell`}>
							{driverStats.total}
						</td>
						<td
							className={`race-results__table-cell`}>
							{driverStats.average}
						</td>
						<td
							className={`race-results__table-cell`}>
							{driverStats.racesMissed}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	, [stats]);

	const renderStatsSubTable = () => (
		<div className="race-results__end-subtable-container--right">
			<div className={`race-results__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(current => !current)}>
				{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
				{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
			</div>
			{showStats && renderStatsSubTableData()}
		</div>
	);

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
				<Legend
					wrapperStyle={{
						paddingTop: 20,
						marginLeft: 20,
					}}
					formatter={(value, entry, index) => (formatDriverName(value))}
				/>
				{
					participants.map((row) => (
						<Line
							key={row["Driver"]}
							type="monotone"
							dataKey={row["Driver"]}
							stroke={constants.getCarColor(row['Car'], row['Primary'] === 'TRUE')}
						/>
					))
				}
			</LineChart >
		</ResponsiveContainer >
	);


	return (
		<div className="race-results">
			<h1 className='race-results__title'>Driver Standings</h1>

			{isDataReady && (
				<>
					<div className="race-results__table-container">
						{renderDriverSubTable()}
						{renderResultsSubTable()}
						{renderStatsSubTable()}
					</div>
					<div className='race-results__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default DriverStandings;
