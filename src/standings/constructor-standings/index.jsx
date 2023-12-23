import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getConstructorPoints, getConstructorStats, getRaceResults, getTrackList, getParticipants } from '@/redux/selectors';
import { fetchConstructorPoints, fetchConstructorStats, fetchRaceResults, fetchTrackList, fetchParticipants } from '@/redux/actions';
import { isEmpty, last, isNaN } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from '@/components/constructor-badge';
import useFormatTrackName from '@/hooks/useFormatTrackName';
import useFormatConstructorName from '@/hooks/useFormatConstructorName';
import useGraphTrackOrientation from '@/hooks/useGraphTrackOrientation';
import { round, getCarColor, tableSortFunction, nameSortFunction, cb } from '@/utils/utils';
import TableTooltip from '@/components/table-tooltip';
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
import useSortInUrlParams from '@/hooks/useSortInUrlParams';

const blockName = 'constructor-standings';
const bem = cb(blockName);

const statHeaders = [
	{key: 'total', label: 'TOTAL'},
	{key: 'averagePoints', label: 'AVG'},
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

const ConstructorStandings = ({show}) => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useSortInUrlParams(defaultSortBy);
	const [sortedConstructorPoints, setSortedConstructorPoints] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const formatTrackName = useFormatTrackName();
	const formatConstructorName = useFormatConstructorName();
	const graphTrackOrientation = useGraphTrackOrientation();

	const { content: raceResults, loading: raceResultsLoading, fetched: raceResultsFetched, error: raceResultsError } = useSelector(getRaceResults);
	const { content: constructorPoints, loading: constructorPointsLoading, fetched: constructorPointsFetched, error: constructorPointsError } = useSelector(getConstructorPoints);
	const { content: constructorStats, loading: constructorStatsLoading, fetched: constructorStatsFetched, error: constructorStatsError } = useSelector(getConstructorStats);
	const { content: trackList, loading: trackListLoading, fetched: trackListFetched, error: trackListError } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, fetched: participantsFetched, error: participantsError } = useSelector(getParticipants);

	if (!raceResultsFetched && !raceResultsLoading && !raceResultsError) dispatch(fetchRaceResults());
	if (!constructorPointsFetched && !constructorPointsLoading && !constructorPointsError) dispatch(fetchConstructorPoints());
	if (!constructorStatsFetched && !constructorStatsLoading && !constructorStatsError) dispatch(fetchConstructorStats());
	if (!trackListFetched && !trackListLoading && !trackListError) dispatch(fetchTrackList());
	if (!participantsFetched && !participantsLoading && !participantsError) dispatch(fetchParticipants());

	const constructors = useMemo(() => [...new Set(participants?.map(({ car }) => car))], [participants])

	useEffect(() => {
		const constructorPointsCopy = [...constructorPoints];
		const statsCopy = [...constructorStats];
		if (sortBy === null) {
			const sortedStats =  [...statsCopy.sort((a,b) => tableSortFunction(a, b, defaultSortBy))]
			setSortedStats(sortedStats);
			const sortedConstructors = sortedStats.map(stat => stat.car);
			setSortedConstructorPoints([...constructorPointsCopy.sort((a, b) => sortedConstructors.indexOf(a.car) - sortedConstructors.indexOf(b.car))]);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))]
			setSortedStats(sortedStats);
			const sortedConstructors = sortedStats.map(stat => stat.car);
			setSortedConstructorPoints([...constructorPointsCopy.sort((a, b) => sortedConstructors.indexOf(a.car) - sortedConstructors.indexOf(b.car))]);
		} else if(sortBy.key === 'car') {
			const sortedStats =  [...statsCopy.sort((a,b) => nameSortFunction(a, b, sortBy))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.car);
			setSortedConstructorPoints([...constructorPointsCopy.sort((a, b) => sortedDrivers.indexOf(a.car) - sortedDrivers.indexOf(b.car))]);
		} else {
			const sortedConstructorPointsCopy = [...constructorPointsCopy.sort((a,b) => tableSortFunction(a, b, sortBy))];
			setSortedConstructorPoints(sortedConstructorPointsCopy);
			const sortedConstructors = sortedConstructorPointsCopy.map((raceResult) => raceResult.car);
			setSortedStats([...statsCopy.sort((a, b) => sortedConstructors.indexOf(a.car) - sortedConstructors.indexOf(b.car))]);
		}
	}, [constructorPoints, sortBy, constructorStats]);

	const lastPosition = useMemo(() => {
		return Math.max(...raceResults.map(row =>
			trackList.map(({key}) => +row[key]).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [trackList, raceResults]);

	const data = useMemo(() => 
		trackList.reduce((acc, track) => {
			const trackScores = {
				name: formatTrackName(track.label)
			};
			constructorPoints.forEach(row => {
				let result = row[track.key];
				const previousScore = last(acc)?.[row.car] ?? 0;
				if (result === 'DNS' || result === 'DNF' || result === undefined) return;

				trackScores[row.car] = +result + previousScore;
			});
			acc.push(trackScores);
			return acc;
		}, [])
	, [trackList, constructorPoints, formatTrackName])

	const getClassName = (header) => {
		if (header === 'Driver') return bem('driver');
		if (header === 'Car') return bem('car');
		return bem('track')
	};

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

	const renderConstructorSubTable = useMemo(() => (
		<div className={bem('end-subtable-container', 'left')}>
			<table>
				<thead>
					<tr>
						<th 
							className={`${bem('table-header')} ${bem('driver-standings__table-header--sortable')}`}
							onClick={() => sortByKey('car')}
						>
							Constructor {getSortIcon('car')}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedConstructorPoints.map(({car}) => (
						<tr key={car}>
							<td className={bem('table-cell')}>
								<TableTooltip innerHtml={car} customClass={bem('driver-label')}>
									{formatConstructorName(car)} <ConstructorBadge constructor={car} />
								</TableTooltip>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	), [sortedConstructorPoints, formatConstructorName, sortByKey, getSortIcon]);


	const renderResultsSubTable = useMemo(() => {
		return (
			<div className={bem('results-subtable-container')}>
				<table>
					<thead>
						<tr>
							{trackList.map(track => 
								<th
									key={track.key} 
									className={`${bem('table-header')} ${bem('table-header--sortable')}`} 
									onClick={() => sortByKey(track.key)}
								>
									{formatTrackName(track.label)} {getSortIcon(track.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedConstructorPoints.map((row) => (
							<tr key={row.car} className={bem('row')}>
								{trackList.map((track, index) =>
									<td
										key={`${row.car}-${index}`}
										className={`${bem('table-cell')} ${getClassName(track.key)}`}>
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
	}, [trackList, formatTrackName, sortedConstructorPoints, sortByKey, getSortIcon]);

	const renderStatsSubTable = useMemo(() => {
		const renderStatsSubTableData = () => 
			<table>
				<thead>
					<tr>
						{statHeaders.map((header) => 
							<th
								key={header.key}
								className={`${bem('table-header')} ${bem('table-header--sortable')}`}
								onClick={() => sortByKey(header.key)}
							>
								{header.label} {getSortIcon(header.key)}
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{sortedStats.map((constructorStats) => (
						<tr key={constructorStats.car}>
							<td
								className={bem('table-cell')}>
								{constructorStats.total}
							</td>
							<td
								className={bem('table-cell')}>
								<TableTooltip innerHtml={round(constructorStats.averagePoints, {decimalPlace: 8})} hangLeft>
									{round(constructorStats.averagePoints)}
								</TableTooltip>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		;

		return (
			<div className={bem('end-subtable-container', 'right')}>
				<div
					className={`${bem('toggle-stats')} ${showStats ? 'show' : ''}`}
					onClick={() => setShowStats(current => !current)}
				>
					{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
					{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
				</div>
				{showStats && renderStatsSubTableData()}
			</div>
		);
	}, [sortedStats, showStats, sortByKey, getSortIcon]);

	const getCustomLineOpacity = (item) => isEmpty(graphFilter) ?  0.9 : graphFilter?.includes(item) ?  0.9 : 0.15;
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
						{formatConstructorName(entry.value)}
					</LegendSpan>
				))}
			</LegendWrapper>
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
				<Legend content={customLegend} />
				{renderLines()}
			</LineChart >
		</ResponsiveContainer >
	);

	const isDataReady = (
		raceResultsFetched && !raceResultsLoading
		&& constructorPointsFetched && !constructorPointsLoading
		&& !isEmpty(trackList) && !trackListLoading
		&& !isEmpty(participants) && !participantsLoading
	);

	return show && (
		<div className={blockName}>
			{isDataReady && (
				<>
					<div className={bem('table-container')}>
						{renderConstructorSubTable}
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

export default ConstructorStandings;
