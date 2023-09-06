import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getQualifying, getTrackList, getParticipants, getDriverStats } from 'src/redux/selectors';
import { fetchQualifying, fetchTrackList, fetchParticipants, fetchDriverStats } from 'src/redux/actions';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useIsMobile from 'src/hooks/useIsMobile';
import { trackDetails } from 'src/utils/constants';
import { round, getCarColor, tableSortFunction } from 'src/utils/utils';
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
	{key: 'averageQualifying', label: 'AVG'},
	{key: 'averageDifference', label: 'DIFF'},
	{key: 'poles', label: 'POLES'},
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

const defaultSortBy = {
	key: 'averageQualifying',
	direction: 'desc'
};

const Qualifying = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedQualifyingResults, setSortedQualifyingResults] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: qualifyingResults, loading: qualifyingLoading, error: qualifyingResultsError } = useSelector(getQualifying);
	const { content: trackList, loading: trackListLoading, error: trackListError } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, error: participantsError } = useSelector(getParticipants);
	const { content: driverStats, loading: driverStatsLoading, error: driverStatsError } = useSelector(getDriverStats);

	if (isEmpty(qualifyingResults) && !qualifyingLoading && !qualifyingResultsError) dispatch(fetchQualifying());
	if (isEmpty(trackList) && !trackListLoading && !trackListError) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading && !participantsError) dispatch(fetchParticipants());
	if (isEmpty(driverStats) && !driverStatsLoading && !driverStatsError) dispatch(fetchDriverStats());

	const formatDriverName = useCallback((driver) => !isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => !isMobile ? track : trackDetails[track]?.abbreviation, [isMobile])

	useEffect(() => {
		const qualifyingResultsCopy = [...qualifyingResults];
		const statsCopy = [...driverStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, defaultSortBy, ['averageQualifying']))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedQualifyingResults([...qualifyingResultsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, ['averageQualifying']))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedQualifyingResults([...qualifyingResultsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		} else {
			const sortedQualifyingResults = [...qualifyingResultsCopy.sort((a, b) => tableSortFunction(a, b, sortBy, 'all'))];
			setSortedQualifyingResults(sortedQualifyingResults);
			const sortedDrivers = sortedQualifyingResults.map((qualifyingResult) => qualifyingResult.driver);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [qualifyingResults, sortBy, driverStats]);

	const lastPosition = useMemo(() => {
		return Math.max(...qualifyingResults.map(row =>
			trackList.map(({key}) => parseInt(row[key])).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [trackList, qualifyingResults]);

	const data = useMemo(() => {
		return trackList.map(track => {
			const trackScores = {
				name: formatTrackName(track.label)
			};
			qualifyingResults.forEach(row => {
				let result = row[track.key];
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row.driver] = +result;
			});
			return trackScores;
		})
	}, [trackList, qualifyingResults, formatTrackName])

	const graphTrackOrientation = useMemo(() => !isMobile ? 0 : 270, [isMobile]);

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
						<tr key={row.driver}>
							<td className={`qualifying__table-cell`}>
								<div className='qualifying__driver-label'>
									{formatDriverName(row.driver)} <ConstructorBadge constructor={row.car} />
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

	const displayAverageDifference = (difference) => {
		const roundedDifference = round(difference);
		if (roundedDifference > 0) {
			return `+${roundedDifference}`;
		} 
		return `${roundedDifference}`;
	};

	const renderResultsSubTable = useMemo(() => {
		return (
			<div className="qualifying__results-subtable-container">
				<table>
					<thead>
						<tr>
						{trackList.map(track => 
							<th 
								key={track.key} 
								className="qualifying__table-header qualifying__table-header--sortable" 
								onClick={() => sortByKey(track.key)}
							>
								{formatTrackName(track.label)} {getSortIcon(track.key)}
							</th>
						)}
						</tr>
					</thead>
					<tbody>
						{sortedQualifyingResults.map((row) => (
							<tr key={row.driver}>
								{trackList.map((track, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`qualifying__table-cell ${getClassName(track.key)}`}>
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
	}, [trackList, formatTrackName, sortedQualifyingResults, sortByKey, getSortIcon]);

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
									<TableTooltip innerHtml={round(driverStats.averageQualifying, 8)} hangLeft>
										{round(driverStats.averageQualifying)}
									</TableTooltip>
								</td>
								<td
									className={`qualifying__table-cell`}>
									{displayAverageDifference(driverStats.averageDifference)}
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
