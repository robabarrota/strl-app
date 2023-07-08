import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getTrackList } from 'src/redux/selectors';
import { fetchTrackList } from 'src/redux/actions';
import { isEmpty } from 'lodash';
import React, { useMemo, useRef } from 'react';
import { trackDetails } from 'src/utils/constants';
import styled from 'styled-components';

const Schedule = () => {
	const dispatch = useDispatch();
	const nextRaceRef = useRef();

	const scrollToNextRace = () => {
		if (nextRaceRef.current) {
			// nextRaceRef.current.scrollIntoView();
			const yOffset = -20; 
			const y = nextRaceRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	};

	const { content: trackList, loading: trackListLoading } = useSelector(getTrackList);

	if (isEmpty(trackList) && !trackListLoading) dispatch(fetchTrackList());

	const isDataReady = useMemo(() => !(isEmpty(trackList) || trackListLoading),
		[trackList, trackListLoading])

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
		return trackList.find(({ Date: date }) => new Date(date) >= now)?.['Track'];
	}, [trackList]);

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
			border-color: ${props => props.isNext ? "#00e10b" : "#e10600"};
		}
	`;

	const RoundTitle = styled.legend`
		font-family: "Titillium Web";
		font-size: 15px;
		line-height: 20px;
		font-weight: 700;
		padding-right: 10px;
		text-transform: uppercase;
		color: ${props => props.isNext ? "#00e10b" : "#e10600"};
	`;

	if (isDataReady) {
		return (
			<div className="schedule">
				<HeaderContainer>
					<h1 className="schedule__title">Schedule</h1>
					<button className="schedule__go-to-next" onClick={() => scrollToNextRace()}>Go To Next Race</button>
				</HeaderContainer>

				<div className="schedule__race-card-container">
					{trackList.map(({ Date: date, Track }, index) => {
						const isNext = Track === nextTrack;
						const refProps = isNext ? { ref: nextRaceRef } : {};
						return (
							<EventCard isNext={isNext} {...refProps} key={`round-${index + 1}`}>
								<RoundTitle isNext={isNext} >Round {index + 1}</RoundTitle>
								<div className="schedule__event-info">
									<div className="schedule__top-bar">
										<p className="schedule__days">{getDayRange(date)}</p>
										<div className="schedule__country-flag">
											<img src={trackDetails[Track]?.flag} alt={`${Track} flag`} />
										</div>
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
											{Track}
										</div>
										<div className="schedule__event-description--title">
											{trackDetails[Track]?.fullName}
										</div>
									</div>
								</div>
								<div className="schedule__event-image">
									<img src={trackDetails[Track]?.map} alt={`${Track} map`} />
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
