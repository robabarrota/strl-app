import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getTrackList } from '@/redux/selectors';
import { fetchTrackList } from '@/redux/actions';
import React, { useMemo, useRef } from 'react';
import { trackDetails } from '@/utils/constants';
import styled from 'styled-components';
import Countdown from './countdown';
import SessionSchedule from './session-schedule';
import WeatherPanel from './weather-panel';
import useIsMobile from '@/hooks/useIsMobile';

const HeaderContainer = styled.fieldset`
	display: flex;
	justify-content: space-between;
`;

const EventCard = styled.fieldset`
	border-top: solid 2px #000;
	border-right: solid 2px #000;
	border-top-right-radius: 10px;
	padding-top: 0;
	padding-top: 0;
	margin-top: 40px;
	padding-right: 10px;
	transition: .1s all ease;

	&:hover, &:focus, &:active {
		padding-top: 10px;
		margin-top: 30px;
		border-color: #e10600;
	}
`;

const RoundTitle = styled.legend`
	font-family: "Titillium Web";
	font-size: 15px;
	line-height: 20px;
	font-weight: 700;
	padding-right: 10px;
	text-transform: uppercase;
	color: #e10600;
`;

const CurrentEventCard = styled.fieldset`
	border-top: solid 10px #e10600;
	border-right: solid 10px #e10600;
	border-top-right-radius: 25px;
	padding-top: 0;
	padding-right: 10px;
`;

const CountryFlag = styled.fieldset`
	width: ${props => props.completed ? '30px' : '48px'};
	border: 1px solid #949498;
	overflow: hidden;
	border-radius: 3px;
	position: relative;
	top: -2px;

	> img {
		width: 100%;
		height: auto;
		display: block;
	}
`;

const CurrentRaceDetailsContainer = styled.div`
	display: grid;
	grid-template-columns: ${props => props.isMobile ? 'repeat(auto-fit, minmax(300px, auto))' : 'auto 1fr auto'};
	gap: 10px;
`;

const Schedule = () => {
	const dispatch = useDispatch();
	const nextRaceRef = useRef();

	const isMobile = useIsMobile();

	const scrollToNextRace = () => {
		if (nextRaceRef.current) {
			// nextRaceRef.current.scrollIntoView();
			const yOffset = -76; 
			const y = nextRaceRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	};

	const { content: trackList, loading: trackListLoading, error: trackListError, fetched: trackListFetched } = useSelector(getTrackList);

	if (!trackListFetched && !trackListLoading && !trackListError) dispatch(fetchTrackList());

	const isDataReady = useMemo(() => trackListFetched && !trackListLoading, [trackListFetched, trackListLoading])

	const getDayRange = (date) => {
		const startDate = new Date(date);
		const endDate = new Date(date);
		endDate.setDate(startDate.getDate() + 2);
		return `${startDate.getDate()}-${endDate.getDate()}`;
	}

	const isRaceOver = (date) => {
		const raceDate = new Date(date);
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		return raceDate < now;
	}

	const nextTrack = useMemo(() => {
		const now = new Date();
		now.setHours(0,0,0,0);
		return trackList.find(({ date }) => new Date(date) >= now);
	}, [trackList]);

	const nextRaceDate = useMemo(() => {
		if (!nextTrack) return new Date();
		const date = new Date(nextTrack.date);
		date.setHours(19, 30, 0)
		return date;
	}, [nextTrack])

	const completedRaces = useMemo(() => {
		const now = new Date();
		now.setHours(0,0,0,0);
		return trackList.filter(({ date }) => new Date(date) < now);
	}, [trackList])

	const futureRaces = useMemo(() => {
		if (!nextTrack) return [];
		const now = new Date();
		now.setHours(0,0,0,0);
		return trackList.filter(({date, key}) => new Date(date) > now && key !== nextTrack.key);
	}, [trackList, nextTrack])

	if (isDataReady) {
		return (
			<div className="schedule">
				<HeaderContainer>
					<h1 className="schedule__title">Schedule</h1>
					{!!nextTrack && <button className="schedule__go-to-next" onClick={() => scrollToNextRace()} disabled={!nextTrack}>Go To Next Race</button>}
				</HeaderContainer>

				<div className="schedule__race-card-container">
					{completedRaces.map(({ date, label }, index) => {
						return (
							<EventCard key={`round-${index + 1}`}>
								<RoundTitle>Round {index + 1}</RoundTitle>
								<div className="schedule__event-info">
									<div className="schedule__top-bar">
										<p className="schedule__days">{getDayRange(date)}</p>
										<CountryFlag completed>
											<img src={trackDetails[label]?.flag} alt={`${label} flag`} />
										</CountryFlag>
									</div>
									<div className="schedule__month-container">
										<span className="schedule__month">
											{new Date(date).toLocaleString('default', { month: 'short' })}
										</span>
										{isRaceOver(date) &&
											<span className="schedule__finish-banner-container">
												<img src="https://www.formula1.com/etc/designs/fom-website/images/flag-asset.png" alt="race finished" />
											</span>
										}
									</div>
								</div>
								<div className="schedule__event-details">
									<div className="schedule__event-description">
										<div className="schedule__event-description--track">
											{label}
										</div>
										<div className="schedule__event-description--title">
											{trackDetails[label]?.fullName}
										</div>
									</div>
								</div>
								<div className="schedule__event-image">
									<img src={trackDetails[label]?.map} alt={`${label} map`} />
								</div>
							</EventCard>
						)
					})}
				</div>
				{nextTrack && 
					<div className="schedule__current-race-container" ref={nextRaceRef}>
						<CurrentEventCard key={`round-${completedRaces.length + 1}`}>
							<RoundTitle>Round {completedRaces.length + 1} - Up Next</RoundTitle>
							<CurrentRaceDetailsContainer isMobile={isMobile}>
								<div className="schedule__current-race-track-panel">
									<div className="schedule__event-info">
										<div className="schedule__top-bar">
											<div>
												<p className="schedule__days">{getDayRange(nextTrack.date)}</p>
												<div className="schedule__month-container">
													<span className="schedule__month">
														{new Date(nextTrack.date).toLocaleString('default', { month: 'short' })}
													</span>
													{isRaceOver(nextTrack.date) &&
														<span className="schedule__finish-banner-container">
															<img src="https://www.formula1.com/etc/designs/fom-website/images/flag-asset.png" alt="race finished" />
														</span>
													}
												</div>
											</div>
											<CountryFlag>
												<img src={trackDetails[nextTrack.label]?.flag} alt={`${nextTrack.label} flag`} />
											</CountryFlag>
										</div>
										
									</div>
									<div className="schedule__event-details">
										<div className="schedule__event-description">
											<div className="schedule__event-description--track">
												{nextTrack.label}
											</div>
											<div className="schedule__event-description--title">
												{trackDetails[nextTrack.label]?.fullName}
											</div>
										</div>
									</div>
									<div className="schedule__current-event-image">
										<img src={trackDetails[nextTrack.label]?.whiteMap} alt={`${nextTrack.label} map`} />
									</div>
								</div>
								{!isMobile && <WeatherPanel trackInfo={nextTrack}/>}
								<div className="schedule__current-race-session-panel">
									<Countdown targetDate={nextRaceDate}/>
									{isMobile && <WeatherPanel trackInfo={nextTrack}/>}
									<SessionSchedule />
								</div>
							</CurrentRaceDetailsContainer>
						</CurrentEventCard>
					</div>
				}
				<div className="schedule__race-card-container">
					{futureRaces.map(({ date, label }, index) => {
						return (
							<EventCard key={`round-${index + 2}`}>
								<RoundTitle>Round {index + 2}</RoundTitle>
								<div className="schedule__event-info">
									<div className="schedule__top-bar">
											<div>
												<p className="schedule__days">{getDayRange(date)}</p>
												<div className="schedule__month-container">
													<span className="schedule__month">
														{new Date(date).toLocaleString('default', { month: 'short' })}
													</span>
													{isRaceOver(date) &&
														<span className="schedule__finish-banner-container">
															<img src="https://www.formula1.com/etc/designs/fom-website/images/flag-asset.png" alt="race finished" />
														</span>
													}
												</div>
											</div>
										<CountryFlag>
											<img src={trackDetails[label]?.flag} alt={`${label} flag`} />
										</CountryFlag>
									</div>
									
								</div>
								<div className="schedule__event-details">
									<div className="schedule__event-description">
										<div className="schedule__event-description--track">
											{label}
										</div>
										<div className="schedule__event-description--title">
											{trackDetails[label]?.fullName}
										</div>
									</div>
								</div>
								<div className="schedule__event-image">
									<img src={trackDetails[label]?.map} alt={`${label} map`} />
								</div>
							</EventCard>
						)
					})}
				</div>
			</div>
		);
	}
}

export default Schedule;
