import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getQualifying, getTrackList, getParticipants } from 'src/redux/selectors';
import { fetchQualifying, fetchTrackList, fetchParticipants } from 'src/redux/actions';
import { isEmpty, groupBy, first } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import ConstructorBadge from 'src/components/constructor-badge';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import constants from 'src/utils/constants';
const Qualifying = () => {
	const dispatch = useDispatch();
	const [showStats, setShowStats] = useState(false);
	const { width } = useWindowDimensions();

	const { content: qualifyingResults, loading: qualifyingLoading } = useSelector(getQualifying);
	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);
	const { content: participants, loading: participantsLoading } = useSelector(getParticipants);

	if (isEmpty(qualifyingResults) && !qualifyingLoading) dispatch(fetchQualifying());
	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());
	if (isEmpty(participants) && !participantsLoading) dispatch(fetchParticipants());

	const qualifyingStats = useMemo(() => {
		const groupedDrivers = groupBy(qualifyingResults, 'Driver');
		if (isEmpty(groupedDrivers)) return [];
		const driverQualifyingStats = Object.entries(groupedDrivers).map(([driver, driverResults]) => {
			const results = first(driverResults);
			let racesMissed = 0;
			let totalQualifying = 0;
			let totalRaces = 0;
			Object.entries(results).filter(([key, value]) => key !== 'Car' && key !== 'Driver').forEach(([track, result]) => {
				if (result === 'DNS') racesMissed++;

				if (result !== 'DNF' && result !== 'DNS') totalQualifying += parseInt(result);
				totalRaces++;
			});

			return {
				driver,
				average: totalQualifying / totalRaces,
				racesMissed
			}
		})
		return driverQualifyingStats;
	}, [qualifyingResults]);

	const resultHeaders = useMemo(() => trackList?.map((track) =>
		track
	), [trackList]);

	const getClassName = (header) => {
		if (header === 'Driver') return 'qualifying__driver';
		if (header === 'Car') return 'qualifying__car';
		return 'qualifying__track'
	}

	const formatDriverName = useCallback((driver) => width > 820 ? driver : driver.split(' ')[0], [width])
	const formatTrackName = useCallback((track) => width > 820 ? track : constants.trackAbbreviationMap[track], [width])

	const renderDriverSubTable = () => (
		<div className="qualifying__end-subtable-container--left">
			<table>
				<thead>
					<tr>
						<th className="qualifying__table-header">Driver</th>
					</tr>
				</thead>
				<tbody>
					{participants.map((row) => (
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
	);

	const renderResultsSubTable = () => (
		<div className="qualifying__results-subtable-container">
			<table>
				<thead>
					<tr>
						{resultHeaders.map(header => <th key={header} className="qualifying__table-header">{formatTrackName(header)}</th>)}
					</tr>
				</thead>
				<tbody>
					{qualifyingResults.map((row) => (
						<tr key={row['Driver']}>
							{resultHeaders.map((header, index) =>
								<td
									key={`${row['Driver']}-${index}`}
									className={`qualifying__table-cell ${getClassName(header)}`}>
									{row[header]}
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	const renderStatsSubTable = () => (
		<div className="qualifying__end-subtable-container--right">
			<div className={`qualifying__toggle-stats ${showStats ? 'show' : ''}`} onClick={() => setShowStats(!showStats)}>
				{showStats && <i className={"fa-solid fa-chevron-right"}></i>}
				{!showStats && <i className={"fa-solid fa-chevron-left"}></i>}
			</div>
			{showStats && (
				<table>
					<thead>
						<tr>
							<th className="qualifying__table-header">AVG</th>
							<th className="qualifying__table-header">DNS's</th>
						</tr>
					</thead>
					<tbody>
						{qualifyingStats.map((driverStats) => (
							<tr key={driverStats.driver}>
								<td
									className={`qualifying__table-cell`}>
									{driverStats.average}
								</td>
								<td
									className={`qualifying__table-cell`}>
									{driverStats.racesMissed}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);

	if (qualifyingResults) {
		return (
			<>
				<h1 className='qualifying__title'>Qualifying</h1>
				<div className="qualifying__table-container">
					{renderDriverSubTable()}
					{renderResultsSubTable()}
					{renderStatsSubTable()}
				</div>

			</>
		);
	}
}

export default Qualifying;
