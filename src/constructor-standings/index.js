import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRaceResults, getFastestLaps, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchRaceResults, fetchFastestLaps, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, last, isNaN } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import {
	carAbbreviationMap,
	trackAbbreviationMap,
	pointMap,
	getCarColor
} from 'src/utils/constants';
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

const statHeaders = [
	{key: 'total', label: 'TOTAL'},
	{key: 'average', label: 'AVG'},
];

const ConstructorStandings = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedConstructorPoints, setSortedConstructorPoints] = useState([]);
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

	const isDataReady = useMemo(() =>
		!(isEmpty(raceResults) || raceResultsLoading
			|| isEmpty(trackList) || trackListLoading
			|| isEmpty(participants) || participantsLoading),
		[raceResults, raceResultsLoading, trackList, trackListLoading, participants, participantsLoading]);

	const trackSortFunction = useCallback((a, b) => {
		if ( parseInt(a[sortBy.key]) < parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? 1 : -1;
		}
		if ( parseInt(a[sortBy.key]) > parseInt(b[sortBy.key]) ){
			return sortBy.direction === 'desc' ? -1 : 1;
		}
		return 0;
	}, [sortBy]);

	const statSortFunction = useCallback((a, b) => {
		const getCorrectSortValue = (initialValue) => {
			let sortModifier = 1;
			sortModifier *= sortBy.direction === 'desc' ? -1 : 1;
			sortModifier *= sortBy.key === 'racesMissed' ? -1 : 1;

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

	const formatConstructorName = useCallback((constructor) => isMobile ? constructor : carAbbreviationMap[constructor], [isMobile])
	const formatTrackName = useCallback((track) => isMobile ? track : trackAbbreviationMap[track], [isMobile])

	const resultHeaders = useMemo(() => trackList?.map(({ Track }) => Track), [trackList]);

	const constructors = useMemo(() => [...new Set(participants?.map(({ Car }) => Car))], [participants])

	const constructorPoints = useMemo(() => 
		raceResults.reduce((acc, row) => {
			const constructor = { 'Car': row['Car'] };
			const constructorIndex = acc.findIndex(constructors => constructors['Car'] === row['Car']);
			resultHeaders.forEach(header => {
				let racePoints = pointMap[row[header]];
				if (racePoints && fastestLaps[header] === row['Driver'] && row[header] <= 10) racePoints += 1;
				if (constructorIndex > -1 && racePoints !== undefined) {
					acc[constructorIndex][header] += racePoints;  
				} else {
					constructor[header] = racePoints;
				}
			});
			if (constructorIndex === -1) acc.push(constructor);
			return acc;
		}, []), [raceResults, resultHeaders, fastestLaps]);

	const stats = useMemo(() => 
		constructorPoints.map(constructor => {
			const name = constructor['Car'];
			let totalRaces = 0;
			const totalPoints = Object.entries(constructor)
			.filter(([key, value]) => key !== 'Car')
			.reduce((acc, [track, points]) => {
				if (Number.isInteger(points)) acc += Number(points);
				if (points !== undefined) totalRaces++;
				return acc;
			}, 0)
			return {
				constructor: name,
				average: totalPoints / totalRaces,
				total: totalPoints,
			}
		})
	, [constructorPoints]);

	useEffect(() => {
		const constructorPointsCopy = [...constructorPoints];
		const statsCopy = [...stats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedConstructorPoints(constructorPointsCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort(statSortFunction)]
			setSortedStats(sortedStats);
			const sortedConstructors = sortedStats.map(stat => stat.constructor);
			setSortedConstructorPoints([...constructorPointsCopy.sort((a, b) => sortedConstructors.indexOf(a['Car']) - sortedConstructors.indexOf(b['Car']))]);
		} else {
			const sortedConstructorPointsCopy = [...constructorPointsCopy.sort(trackSortFunction)];
			setSortedConstructorPoints(sortedConstructorPointsCopy);
			const sortedConstructors = sortedConstructorPointsCopy.map((raceResult) => raceResult['Car']);
			setSortedStats([...statsCopy.sort((a, b) => sortedConstructors.indexOf(a.constructor) - sortedConstructors.indexOf(b.constructor))]);
		}
	}, [constructorPoints, trackSortFunction, sortBy, statSortFunction, stats]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			resultHeaders.map(track => parseInt(row[track])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [resultHeaders, raceResults]);

	const data = useMemo(() => 
		{ 
			return resultHeaders.reduce((acc, track) => {
			const trackScores = {
				name: formatTrackName(track)
			};
			constructorPoints.forEach(row => {
				let result = row[track];
				const previousScore = last(acc)?.[row['Car']] ?? 0;
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row['Car']] = parseInt(result) + previousScore;
			});
			acc.push(trackScores);
			return acc;
		}, [])
	}
	, [resultHeaders, constructorPoints, formatTrackName])

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'constructor-standings__driver';
		if (header === 'Car') return 'constructor-standings__car';
		return 'constructor-standings__track'
	};

	const renderConstructorSubTable = useMemo(() => (
		<div className="constructor-standings__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="constructor-standings__table-header">Constructor</th>
					</tr>
				</thead>
				<tbody>
					{sortedConstructorPoints.map(({Car: name}) => (
						<tr key={name}>
							<td className={`constructor-standings__table-cell`}>
								<div className='constructor-standings__driver-label'>
									{formatConstructorName(name)} <ConstructorBadge constructor={name} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedConstructorPoints, formatConstructorName]);

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
			<div className="constructor-standings__results-subtable-container">
				<table>
					<thead>
						<tr>
							{resultHeaders.map(header => 
								<th 
									key={header} 
									className="constructor-standings__table-header constructor-standings__table-header--sortable" 
									onClick={() => sortByKey(header)}
								>
									{formatTrackName(header)} {getSortIcon(header)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedConstructorPoints.map((row) => (
							<tr key={row['Car']}>
								{resultHeaders.map((header, index) =>
									<td
										key={`${row['Car']}-${index}`}
										className={`constructor-standings__table-cell ${getClassName(header)}`}>
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
	}, [resultHeaders, formatTrackName, sortedConstructorPoints, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => {
		const renderStatsSubTableData = () => 
			<table>
				<thead>
					<tr>
						{statHeaders.map((header) => 
							<th
								key={header.key}
								className="constructor-standings__table-header constructor-standings__table-header--sortable"
								onClick={() => sortByKey(header.key)}
							>
								{header.label} {getSortIcon(header.key)}
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{sortedStats.map((constructorStats) => (
						<tr key={constructorStats.constructor}>
							<td
								className={`constructor-standings__table-cell`}>
								{constructorStats.total}
							</td>
							<td
								className={`constructor-standings__table-cell`}>
								{constructorStats.average}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		;

		return (
			<div className="constructor-standings__end-subtable-container--right">
				<div className={`constructor-standings__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(current => !current)}>
					{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
					{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
				</div>
				{showStats && renderStatsSubTableData()}
			</div>
		);
	}, [sortedStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ? null : graphFilter?.includes(item) ? 1 : 0.15;
	const getStrokeWidth = (item) => isEmpty(graphFilter) ? 1 : graphFilter?.includes(item) ? 2 : 1;

	const renderLines = () => constructors.map((name) => (
		<Line
			key={name}
			type="monotone"
			dataKey={name}
			stroke={getCarColor(name, true, getCustomLineOpacity(name))}
			connectNulls
			strokeWidth={getStrokeWidth(name)}
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
				formatter={(value, entry, index) => (formatConstructorName(value))}
				onClick={toggleFilter}
			/>
		)
	}, [formatConstructorName, graphFilter]);

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
		<div className="constructor-standings">
			<h1 className='constructor-standings__title'>Constructor Standings</h1>

			{isDataReady && (
				<>
					<div className="constructor-standings__table-container">
						{renderConstructorSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className='constructor-standings__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default ConstructorStandings;
