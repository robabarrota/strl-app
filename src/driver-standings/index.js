import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first, last, isNaN } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import {round} from 'src/utils/utils';
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

const DriverStandings = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
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
		!(isEmpty(raceResults) || raceResultsLoading
			|| isEmpty(trackList) || trackListLoading
			|| isEmpty(participants) || participantsLoading),
		[raceResults, raceResultsLoading, trackList, trackListLoading, participants, participantsLoading])

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
	
	const sortedDriverPoints = useMemo(() => {
		const driverPointsCopy = [...driverPoints];
		return sortBy === null ? driverPointsCopy: [...driverPointsCopy.sort(trackSortFunction)];
	}, [driverPoints, trackSortFunction, sortBy]);

	const formatDriverName = useCallback((driver) => isMobile ? driver : driver.split(' ')[0], [isMobile]);
	const formatTrackName = useCallback((track) => isMobile ? track : constants.trackAbbreviationMap[track], [isMobile]);

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(sortedDriverPoints, 'Driver');
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
	}, [raceResults, sortedDriverPoints]);

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

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'driver-standings__driver';
		if (header === 'Car') return 'driver-standings__car';
		return 'driver-standings__track'
	}
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

	const renderResultsSubTable = useMemo(() => {
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
	}, [resultHeaders, formatTrackName, sortedDriverPoints, sortBy]);

	const renderStatsSubTable = useMemo(() => {
		const renderStatsSubTableData = () => 
			<table>
				<thead>
					<tr>
						<th className="driver-standings__table-header">TOTAL</th>
						<th className="driver-standings__table-header">AVG</th>
						<th className="driver-standings__table-header">DNS's</th>
					</tr>
				</thead>
				<tbody>
					{stats.map((driverStats) => (
						<tr key={driverStats.driver}>
							<td
								className={`driver-standings__table-cell`}>
								{driverStats.total}
							</td>
							<td
								className={`driver-standings__table-cell`}>
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
	}, [stats, showStats]);

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
				<YAxis domain={['dataMin', 'dataMax']} interval={0} tickCount={lastPosition} />
				<ChartTooltip />
				{renderLegend}
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
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
