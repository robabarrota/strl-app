import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getPenalties, getDriverStats, getTrackList, getParticipants } from '@/redux/selectors';
import { fetchPenalties, fetchDriverStats, fetchTrackList, fetchParticipants } from '@/redux/actions';
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ConstructorBadge from '@/components/constructor-badge';
import useIsMobile from '@/hooks/useIsMobile';
import { trackDetails } from '@/utils/constants';
import { round, getCarColor, tableSortFunction } from '@/utils/utils';
import TableTooltip from '@/components/table-tooltip';
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
	{key: 'averagePenalties', label: 'AVG'},
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

const Penalties = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const [graphFilter, setGraphFilter] = useState([]);
	const [sortBy, setSortBy] = useState(null);
	const [sortedPenalties, setSortedPenalties] = useState([]);
	const [sortedStats, setSortedStats] = useState([]);
	const isMobile = useIsMobile();

	const { content: penalties, loading: penaltiesLoading, error: penaltiesError, fetched: penaltiesFetched } = useSelector(getPenalties);
	const { content: driverStats, loading: driverStatsLoading, error: driverStatsError, fetched: driverStatsFetched } = useSelector(getDriverStats);
	const { content: trackList, loading: trackListLoading, error: trackListError, fetched: trackListFetched } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading, error: participantsError, fetched: participantsFetched } = useSelector(getParticipants);

	if (!penaltiesFetched && !penaltiesLoading && !penaltiesError) dispatch(fetchPenalties());
	if (!driverStatsFetched && !driverStatsLoading && !driverStatsError) dispatch(fetchDriverStats());
	if (!trackListFetched && !trackListLoading && !trackListError) dispatch(fetchTrackList());
	if (!participantsFetched && !participantsLoading && !participantsError) dispatch(fetchParticipants());

	const formatDriverName = useCallback((driver) => !isMobile ? driver : driver.split(' ')[0], [isMobile])
	const formatTrackName = useCallback((track) => !isMobile ? track : trackDetails[track]?.abbreviation, [isMobile])

	useEffect(() => {
		const penaltiesCopy = [...penalties];
		const statsCopy = [...driverStats];
		if (sortBy === null) {
			setSortedStats(statsCopy);
			setSortedPenalties(penaltiesCopy);
		}
		else if (statHeaders.some((statHeader) => statHeader.key === sortBy.key)) {
			const sortedStats =  [...statsCopy.sort((a, b) => tableSortFunction(a, b, sortBy))]
			setSortedStats(sortedStats);
			const sortedDrivers = sortedStats.map(stat => stat.driver);
			setSortedPenalties([...penaltiesCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		} else {
			const sortedPenalties = [...penaltiesCopy.sort((a, b) => tableSortFunction(a, b, sortBy))];
			setSortedPenalties(sortedPenalties);
			const sortedDrivers = sortedPenalties.map((raceResult) => raceResult.driver);
			setSortedStats([...statsCopy.sort((a, b) => sortedDrivers.indexOf(a.driver) - sortedDrivers.indexOf(b.driver))]);
		}
	}, [penalties, sortBy, driverStats]);

	const lastPosition = useMemo(() => {
		return Math.max(...penalties.map(row =>
			trackList.map(({key}) => +row[key]).filter(position => !isNaN(position))
		).flat()) ?? 0
	}, [trackList, penalties]);

	const data = useMemo(() => 
		trackList.map(track => {
			const trackPenalties = {
				name: formatTrackName(track.label)
			};
			penalties.forEach(row => {
				let result = row[track.key];
				if (result === '' || result === undefined) return;

				trackPenalties[row.driver] = +result;
			});
			return trackPenalties;
		})
	, [trackList, penalties, formatTrackName])

	const graphTrackOrientation = useMemo(() => !isMobile ? 0 : 270, [isMobile]);

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
						<tr key={row.driver}>
							<td className={`penalties__table-cell`}>
								<div className='penalties__driver-label'>
									{formatDriverName(row.driver)} <ConstructorBadge constructor={row.car} />
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
							{trackList.map(track => 
								<th 
									key={track.key} 
									className="penalties__table-header penalties__table-header--sortable" 
									onClick={() => sortByKey(track.key)}
								>
									{formatTrackName(track.label)} {getSortIcon(track.key)}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedPenalties.map((row) => (
							<tr key={row.driver}>
								{trackList.map((track, index) =>
									<td
										key={`${row.driver}-${index}`}
										className={`penalties__table-cell ${getClassName(track.key)}`}>
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
	}, [trackList, formatTrackName, sortedPenalties, sortByKey, getSortIcon]);

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
									<TableTooltip innerHtml={round(driverStats.averagePenalties, 8)} hangLeft>
										{round(driverStats.averagePenalties)}
									</TableTooltip>
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
		penaltiesFetched && !penaltiesLoading
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
