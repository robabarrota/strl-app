import './styles.scss';
import React from 'react';
import styled from 'styled-components';
import { useCountdown } from '@/hooks/useCountdown';
import Clock from './clock';
import useIsMobile from '@/hooks/useIsMobile';

const CountdownContainer = styled.div`
    background-color: #2e6442;
    display: flex;
    ${props => !props.isMobile ? 'max-width: 310px;' : ''}
    border-radius: 10px;
    height: fit-content;
    justify-content: center;
`;

const Title = styled.div`
    color: #fff;
    border-bottom: 1px solid rgba(208,208,210,.4);
    font-family: 'F1BoldRegular';
    font-size: 13px;
    line-height: 14px;
    width: 100%;
    padding: 5px 0;
    font-weight: 500;
    padding-bottom: 6px;
    margin-bottom: 14px;
    text-align: center;
`;

const TimeUnit = styled.div`
    color: ${props => props.isDanger ? "#f00" : "#fff"};
    ${props => !props.isFirst ? 'border-left: 1px solid rgba(208,208,210,.4);' : ''};
    padding: 0 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
`;

const Countdown = ({ targetDate }) => {
    const {days, hours, minutes, seconds} = useCountdown(targetDate);
    const isMobile = useIsMobile();

    const DateTimeDisplay = ({ value, label, isDanger, isFirst }) => {
        return (
            <TimeUnit isDanger={isDanger} isFirst={isFirst} >
                <p className="countdown__time-value">{value}</p>
                <span className="countdown__time-label">{label}</span>
            </TimeUnit>
        );
    };

    const CountdownClock = ({ days, hours, minutes }) => {
        return (
            <div className="countdown__clock-container">
                <Title>Race</Title>
                <div className="countdown__clock">
                    <DateTimeDisplay value={days} label={'Days'} isDanger={days <= 3} isFirst/>
                    <DateTimeDisplay value={hours} label={'Hours'} />
                    <DateTimeDisplay value={minutes} label={'Mins'} />
                </div>
            </div>
        );
    };

    return (
        <CountdownContainer isMobile={isMobile}>
            <CountdownClock
                days={days}
                hours={hours}
                minutes={minutes}
            />
            <Clock 
                hours={hours} 
                minutes={minutes} 
                seconds={seconds} 
            />
        </CountdownContainer>
        
    );
};

export default Countdown;