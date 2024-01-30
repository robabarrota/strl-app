import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getHistoricalDriverStats, getDriverPageData, getParticipants } from '@/redux/selectors';
import { fetchHistoricalDriverStats, fetchParticipants } from '@/redux/actions';
import { cb, getDriverImage, nth } from '@/utils/utils';
import { Link, useParams } from 'react-router-dom';
import { trackDetails } from '@/utils/constants';
import useIsMobile from '@/hooks/useIsMobile';

const blockName = 'driver';
const bem = cb(blockName);

const DriverImage = styled.img`
	display: inline-block;
	height: 100%;
	width: 100%;
    padding: 2px;
	position: relative;
	margin: auto;
	object-fit: contain;
`;

const Background = styled.div`
	display: inline-block;
	height: 100%;
	width: 100%;
	background: linear-gradient(to top, rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.04) 100%), url('/driver-background-image.png');
    padding: 2px;
	background-repeat: repeat;
	background-size: 13%;
`;

const CountryFlag = styled.div`
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	${props => props.$isMobile ? 
			`top: 2px;
			width: 30px;
			height: 100%;` :
			`top: -2px;
			width: 48px;`
	}
	
	> img {
		width: 100%;
		display: block;
		${props => props.$isMobile ? 
			`height: 100%;` :
			`height: auto;`
		}
	}
`;

const DetailsPanel = styled.div`
	display: flex;
	flex-direction: column;
`;

const AdvancedDetailsPanel = styled.div`
	padding: 15px 30px 0 20px;
	${props => props.$isMobile && `border-top: 1px solid #b0b0b0;`}
`

const Driver = () => {
	const dispatch = useDispatch();
	const isMobile = useIsMobile();

	const { driverName } = useParams();
	
	const { loading: historicalDriverStatsLoading, fetched: historicalDriverStatsFetched, error: historicalDriverStatsError } = useSelector(getHistoricalDriverStats);
	const { loading: participantsLoading, fetched: participantsFetched, error: participantsError } = useSelector(getParticipants);

	if (!historicalDriverStatsFetched && !historicalDriverStatsLoading && !historicalDriverStatsError) dispatch(fetchHistoricalDriverStats());
	if (!participantsFetched && !participantsLoading && !participantsError) dispatch(fetchParticipants());

	const driverData = useSelector(getDriverPageData);

	const isDataReady = !historicalDriverStatsLoading && !historicalDriverStatsError;
	const driverInfo = useMemo(() => isDataReady && driverData.find((driverStat) => driverStat.driver === driverName), [driverName, driverData, isDataReady])

	if (driverInfo) {
		return (
			<div className={blockName}>
				<DetailsPanel>
					<div className={bem('image-container')}>
						<Background />
						<DriverImage src={getDriverImage(driverName)} alt={driverName} />
					</div>
					<div className={bem('details')}>
						<div className={bem('basic-details')}>
							<span className={bem('number')}>{driverInfo.number || 0}</span>
							<CountryFlag $isMobile={isMobile}>
								<img src={trackDetails[driverInfo.country]?.flag || trackDetails['Canada']?.flag} alt={`${driverInfo.country} flag`} />
							</CountryFlag>
						</div>
						<h1 className={bem('name')}>{driverName}</h1>
					</div>
					
				</DetailsPanel>
				<AdvancedDetailsPanel $isMobile={isMobile}>
					<div className={bem('stats-link-container')}>

						<Link className={bem('stats-link')} to={`/statistics?view=Historical&driver=${driverName}`}>
							View statistics
							<i className={"fa-solid fa-chevron-right driver__chevron"}></i>
						</Link>

					</div>
					<table className={bem('advanced-details')}>
						<tbody>
							{
								driverInfo.country && (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												Country
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>{driverInfo.country}</td>
									</tr>
								)
							}
							{
								driverInfo.wins > 0 ? (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												Race Wins
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>{driverInfo.wins}</td>
									</tr>
								) : (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												Highest race finish
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>{driverInfo.highestRaceFinish} (x{driverInfo.highestRaceFinishOccurences})</td>
									</tr>
								)
							}
							{
								driverInfo.poles > 0 ? (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												Poles
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>{driverInfo.poles}</td>
									</tr>
								) : (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												Highest qualifying position
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>{driverInfo.highestGridPosition} (x{driverInfo.highestGridPositionOccurences})</td>
									</tr>
								)
							}
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Podiums
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.podiums}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Points
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.points}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Grands Prix entered
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.totalRaces}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										World Championships
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.driversChampionships}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Constructors Championships
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.constructorsChampionships}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Season Joined
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.seasonJoined}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Seasons Raced
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.seasonsRaced}</td>
							</tr>
							{
								driverInfo.firstWinTrack && (
									<tr>
										<th className={bem('advanced-details', 'key')}>
											<span className={bem('advanced-details', 'key--label')}>
												First Win
											</span>
										</th>
										<td className={bem('advanced-details', 'value')}>Season {driverInfo.firstWinSeason}, {driverInfo.firstWinTrack}</td>
									</tr>
								)
							}
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Performance Ranking
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{nth(driverInfo.driverRank) || 'N/A'}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										Attendance Ranking
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{nth(driverInfo.attendanceRank) || 'N/A'}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										STRL Cup Appearances
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.sTRLCupAppearances || 0}</td>
							</tr>
							<tr>
								<th className={bem('advanced-details', 'key')}>
									<span className={bem('advanced-details', 'key--label')}>
										STRL Cup Wins
									</span>
								</th>
								<td className={bem('advanced-details', 'value')}>{driverInfo.sTRLCupWins || 0}</td>
							</tr>
						</tbody>
					</table>
				</AdvancedDetailsPanel>
			</div>
		);
	} else {
		return null;
	}
	
}

export default Driver;
