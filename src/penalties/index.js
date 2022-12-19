import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getPenalties, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchPenalties, fetchTrackList, fetchParticipants } from 'src/redux/actions';
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

const statHeaders = [
	{key: 'average', label: 'AVG'},
];

const Penalties = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedPenalties, setSortedPenalties] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: penalties, loading: penaltiesLoading } = useSelector(getPenalties);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(penalties) && !penaltiesLoading) dispatch(fetchPenalties());
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
		if ( parseInt(a[sortBy.key]) < parseInt(b[sortBy.key]) ){
			return getCorrectSortValue(-1);
		}
		if ( parseInt(a[sortBy.key]) > parseInt(b[sortBy.key]) ){
			return getCorrectSortValue(1);
		}
		return 0;
	}, [sortBy]);

	const formatDriverName = useCallback((driver) => isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => isMobile ? track : trackDetails[track]?.abbreviation, [isMobile])

	const stats = useMemo(() => {
		const groupedDrivers = groupBy(penalties, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalPenalties = 0;
			let totalRaces = 0;
			Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').forEach(([track, result]) => {
				const penaltyPoints = parseInt(result);
				if (!isNaN(penaltyPoints)) totalPenalties += parseInt(result);
				totalRaces++;
			});
			
			const calculatedAverage = totalPenalties / (totalRaces - racesMissed);
			const average = isNaN(calculatedAverage) ? '-' : calculatedAverage;


			return {
				driver,
				average,
			}
		})
		return driverStats;
	}, [penalties]);

	useEffect(() => {
		const penaltiesCopy = [...penalties];
		const statsCopy = [...stats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedPenalties(penaltiesCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort(statSortFunction)]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedPenalties([...penaltiesCopy.sort((a, b) => sortedDrivers.indexOf(a['Driver']) - sortedDrivers.indexOf(b['Driver']))]);
		} else {
			const sortedPenalties = [...penaltiesCopy.sort(trackSortFunction)];
			setSortedPenalties(sortedPenalties);
			const sortedDrivers = sortedPenalties.map((raceResult) => raceResult['Driver']);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [penalties, trackSortFunction, sortBy, statSortFunction, stats]);

	const resultHeaders = useMemo(() => trackList?.map(({Track}) =>
		Track
	), [trackList]);

	const lastPosition = useMemo(() => {
		return Math.max(...penalties.map(row =>
			resultHeaders.map(track => parseInt(row[track])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [resultHeaders, penalties]);

	const data = useMemo(() => {
		return resultHeaders.map(track => {
			const trackPenalties = {
				name: formatTrackName(track)
			};
			penalties.forEach(row => {
				let result = row[track];
				if (result === '' || result === undefined) return;

				trackPenalties[row['Driver']] = parseInt(result);
			});
			return trackPenalties;
		})
	}, [resultHeaders, penalties, formatTrackName])

	const graphTrackOrientation = useMemo(() => isMobile ? 0 : 270, [isMobile]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'penalties__driver';
		if (header === 'Car') return 'penalties__car';
		return 'penalties__track'
	}

	const renderDriverSubTable = useMemo(() => (
		<div className="penalties__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="penalties__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{sortedPenalties.map((row) => (
						<tr key={row['Driver']}>
							<td className={`penalties__table-cell`}>
								<div className='penalties__driver-label'>
									{formatDriverName(row["Driver"])} <ConstructorBadge constructor={row["Car"]} />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedPenalties, formatDriverName]);

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
			<div className="penalties__results-subtable-container">
				<table>
					<thead>
						<tr>
							{resultHeaders.map(header => 
								<th 
									key={header} 
									className="penalties__table-header penalties__table-header--sortable" 
									onClick={() => sortByKey(header)}
								>
									{formatTrackName(header)} {getSortIcon(header)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedPenalties.map((row) => (
							<tr key={row['Driver']}>
								{resultHeaders.map((header, index) =>
									<td
										key={`${row['Driver']}-${index}`}
										className={`penalties__table-cell ${getClassName(header)}`}>
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
	}, [resultHeaders, formatTrackName, sortedPenalties, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => (
		<div className="penalties__end-subtable-container--right">
			<div className={`penalties__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(!showStats)}>
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
									className="penalties__table-header penalties__table-header--sortable"
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
									className={`penalties__table-cell`}>
									<TableTooltip innerHtml={round(driverStats.average, 8)} hangLeft>
										{round(driverStats.average)}
									</TableTooltip>
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
		!isEmpty(sortedPenalties) && !penaltiesLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return (
		<div className="penalties">
			<h1 className='penalties__title'>Penalties</h1>

			{isDataReady && (
				<>
					<div className="penalties__table-container">
						{renderDriverSubTable}
						{renderResultsSubTable}
						{renderStatsSubTable}
					</div>
					<div className='penalties__graph-container'>
						{renderGraph()}
					</div>
				</>
			)}
		</div>
	);

}

export default Penalties;
