import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getQualifying, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchQualifying, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import {
	trackAbbreviationMap,
	getCarColor
} from 'src/utils/constants';
import { round } from 'src/utils/utils';
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

const statHeaders = [
	{key: 'average', label: 'AVG'},
	{key: 'racesMissed', label: 'DNS\'s'},
	{key: 'poles', label: 'POLES'},
];

const Qualifying = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedQualifyingResults, setSortedQualifyingResults] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: qualifyingResults, loading: qualifyingLoading } = useSelector(getQualifying);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(qualifyingResults) && !qualifyingLoading) dispatch(fetchQualifying());
	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading) dispatch(fetchParticipants());

	const trackSortFunction = useCallback((a, b) => {
		if (a[sortBy.key] === 'DNS') return 1;
		if (b[sortBy.key] === 'DNS') return -1;
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
		if ( parseInt(a[sortBy.key]) < parseInt(b[sortBy.key]) ){
			return getCorrectSortValue(-1);
		}
		if ( parseInt(a[sortBy.key]) > parseInt(b[sortBy.key]) ){
			return getCorrectSortValue(1);
		}
		return 0;
	}, [sortBy]);

	const formatDriverName = useCallback((driver) => isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => isMobile ? track : trackAbbreviationMap[track], [isMobile])

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(qualifyingResults, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalQualifying = 0;
			let totalRaces = 0;
			let poles = 0;
			Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').forEach(([track, result]) => {
				if (result === 'DNS') racesMissed++;

				if (result !== 'DNF' && result !== 'DNS') totalQualifying += parseInt(result);
				if (parseInt(result) === 1) poles ++;
				totalRaces++;
			});

			const average = totalQualifying / totalRaces;

			return {
				driver,
				average: average === 0 ? '-' : average,
				racesMissed,
				poles,
			}
		})
		return driverStats;
	}, [qualifyingResults]);

	useEffect(() => {
		const qualifyingResultsCopy = [...qualifyingResults];
		const statsCopy = [...stats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedQualifyingResults(qualifyingResultsCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort(statSortFunction)]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedQualifyingResults([...qualifyingResultsCopy.sort((a, b) => sortedDrivers.indexOf(a['Driver']) - sortedDrivers.indexOf(b['Driver']))]);
		} else {
			const sortedQualifyingResults = [...qualifyingResultsCopy.sort(trackSortFunction)];
			setSortedQualifyingResults(sortedQualifyingResults);
			const sortedDrivers = sortedQualifyingResults.map((qualifyingResult) => qualifyingResult['Driver']);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [qualifyingResults, trackSortFunction, sortBy, statSortFunction, stats]);

	const resultHeaders = useMemo(() => trackList?.map(({Track}) =>
		Track
	), [trackList]);

	const lastPosition = useMemo(() => {
		return Math.max(...qualifyingResults.map(row =>
			resultHeaders.map(track => parseInt(row[track])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [resultHeaders, qualifyingResults]);

	const data = useMemo(() => {
		return resultHeaders.map(track => {
			const trackScores = {
				name: formatTrackName(track)
			};
			qualifyingResults.forEach(row => {
				let result = row[track];
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row['Driver']] = parseInt(result);
			});
			return trackScores;
		})
	}, [resultHeaders, qualifyingResults, formatTrackName])

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'qualifying__driver';
		if (header === 'Car') return 'qualifying__car';
		return 'qualifying__track'
	}
	const renderDriverSubTable = useMemo(() => (
		<div className="qualifying__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="qualifying__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{sortedQualifyingResults.map((row) => (
						<tr key={row['Driver']}>
							<td className={`qualifying__table-cell`}>
								<div className='qualifying__driver-label'>
									{formatDriverName(row["Driver"])} <ConstructorBadge constructor={row["Car"]} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedQualifyingResults, formatDriverName]);

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
			<div className="qualifying__results-subtable-container">
				<table>
					<thead>
						<tr>
						{resultHeaders.map(header => 
							<th 
								key={header} 
								className="qualifying__table-header qualifying__table-header--sortable" 
								onClick={() => sortByKey(header)}
							>
								{formatTrackName(header)} {getSortIcon(header)}
							</th>
						)}
						</tr>
					</thead>
					<tbody>
						{sortedQualifyingResults.map((row) => (
							<tr key={row['Driver']}>
								{resultHeaders.map((header, index) =>
									<td
										key={`${row['Driver']}-${index}`}
										className={`qualifying__table-cell ${getClassName(header)}`}>
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
	}, [resultHeaders, formatTrackName, sortedQualifyingResults, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => (
		<div className="qualifying__end-subtable-container--right">
			<div className={`qualifying__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(!showStats)}>
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
									className="qualifying__table-header qualifying__table-header--sortable"
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
									className={`qualifying__table-cell`}>
									<TableTooltip innerHtml={round(driverStats.average, 8)} hangLeft>
										{round(driverStats.average)}
									</TableTooltip>
								</td>
								<td
									className={`qualifying__table-cell`}>
									{driverStats.racesMissed}
								</td>
								<td
									className={`qualifying__table-cell`}>
									{driverStats.poles}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	), [sortedStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? null : graphFilter?.includes(item) ? 1 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => participants.map((row) => (
		<Line
			key={row["Driver"]}
			type="monotone"
			dataKey={row["Driver"]}
			stroke={getCarColor(row['Car'], row['Primary'] === 'TRUE', getCustomLineOpacity(row['Driver']))}
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

	const isDataReady = (
		!isEmpty(sortedQualifyingResults) && !qualifyingLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return (
		<div className="qualifying">
			<h1 className='qualifying__title'>Qualifying</h1>

			{isDataReady && (
				<>
					<div className="qualifying__table-container">
						{renderDriverSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className='qualifying__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default Qualifying;
