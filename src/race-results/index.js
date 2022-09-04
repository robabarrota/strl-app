import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import constants from 'src/utils/constants';
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

const RaceResults = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const isMobile = useIsMobile();

	const { content: raceResults, loading: raceResultsLoading } = useSelector(getRaceResults);
	const { content: fastestLaps, loading: fastestLapsLoading } = useSelector(getFastestLaps);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(raceResults) && !raceResultsLoading) dispatch(fetchRaceResults());
	if (isEmpty(fastestLaps) && !fastestLapsLoading) dispatch(fetchFastestLaps());
	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading) dispatch(fetchParticipants());

	const isDataReady = useMemo(() =>
		!(
			isEmpty(raceResults) || raceResultsLoading
			|| isEmpty(fastestLaps) || fastestLapsLoading
			|| isEmpty(trackList) || trackListLoading
			|| isEmpty(participants) || participantsLoading),
		[
			raceResults, raceResultsLoading, 
			fastestLaps, fastestLapsLoading, 
			trackList, trackListLoading, 
			participants, participantsLoading
		])

	const formatDriverName = useCallback((driver) => isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => isMobile ? track : constants.trackAbbreviationMap[track], [isMobile])

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

				if (result !== 'DNF' && result !== 'DNS') totalRaceFinish += parseInt(result);
				totalRaces++;
			});
			
			const average = totalRaceFinish / totalRaces;

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
	), [participants, formatDriverName]);

	const renderResultsSubTable = useMemo(() => {
		const fastestLapClass = (driverName, track) => {
			if (fastestLaps[track] === driverName && fastestLaps[track] !== undefined) return 'race-results__fastest';
		};
		return (
			<div className="race-results__results-subtable-container">
				<table>
					<thead>
						<tr>
							{resultHeaders.map(header => <th key={header} className="race-results__table-header">{formatTrackName(header)}</th>)}
						</tr>
					</thead>
					<tbody>
						{raceResults.map((row) => (
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
	}, [resultHeaders, formatTrackName, raceResults, fastestLaps]);

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
							<th className="race-results__table-header">AVG</th>
							<th className="race-results__table-header">DNS's</th>
							<th className="race-results__table-header"><i className="fa-solid fa-stopwatch race-results__fastest-icon"></i></th>
						</tr> 
					</thead>
					<tbody>
						{stats.map((driverStats) => (
							<tr key={driverStats.driver}>
								<td
									className={`race-results__table-cell`}>
									{driverStats.average}
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
	), [stats, showStats]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? null : graphFilter?.includes(item) ? 1 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => participants.map((row) => (
		<Line
			key={row["Driver"]}
			type="monotone"
			dataKey={row["Driver"]}
			stroke={constants.getCarColor(row['Car'], row['Primary'] === 'TRUE', getCustomLineOpacity(row['Driver']))}
			connectNulls
			strokeWidth={getStrokeWidth(row['Driver'])}
		/>
	));

	const renderLegend = useMemo(() => {
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
			<Legend
				wrapperStyle={{
					paddingTop: 20,
					marginLeft: 20,
				}}
				formatter={(value, entry, index) => (formatDriverName(value))}
				onClick={toggleFilter}
			/>
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
				{renderLegend}
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
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
