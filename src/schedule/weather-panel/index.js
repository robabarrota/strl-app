import './styles.scss';
import React from 'react';
import styled from 'styled-components';
import { weatherIconMap, weatherColorMap } from 'src/utils/constants';
import useIsMobile from 'src/hooks/useIsMobile';

const Title = styled.div`
    font-family: 'F1BoldRegular';
    font-size: 18px;
    line-height: 24px;
    border-bottom: 1px solid #949498;
    margin: 0px 6px;
    margin-bottom: 10px;
    padding: 4px 0;
`;

const Stint = styled.div`
    background: linear-gradient(149deg ${props => props.gradientStages?.map((stage, index) => `, ${stage} ${index / props.gradientStages.length * 100}%`)});
    flex: 1;
`;

const WeatherRow = styled.div`
    display: flex;
    padding: 0 10px;
`;

const WeatherItem = styled.div`
    ${props => !props.isFirst ? 'border-left: 1px solid rgba(208,208,210,.4);' : ''};
    display: flex;
    flex-direction: column;
    padding: 0px ${props => props.isMobile ? '10px' : '30px'};
`;

const WeatherLabel = styled.p`
    text-align: center;
    margin: 0;
`;

const WeatherIcon = styled.img`
    height: 4rem;
    width: 4rem;
    margin: auto;
`;

const WeatherPanel = ({trackInfo}) => {
    const isMobile = useIsMobile();
    const qualifyingWeatherGradientStages = [
        weatherColorMap[trackInfo['Q1 Weather']],
        weatherColorMap[trackInfo['Q2 Weather']],
    ];
    const raceWeatherGradientStages = [
        weatherColorMap[trackInfo['R1 Weather']],
        weatherColorMap[trackInfo['R2 Weather']],
        weatherColorMap[trackInfo['R3 Weather']],
    ];
	return (
        <div className="weather-panel">
            <Stint gradientStages={qualifyingWeatherGradientStages}>
                <Title>Qualifying</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo['Q1 Weather']}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo['Q1 Weather']]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo['Q2 Weather']}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo['Q2 Weather']]}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
            <Stint gradientStages={raceWeatherGradientStages}>
                <Title>Race</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo['R1 Weather']}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo['R1 Weather']]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo['R2 Weather']}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo['R2 Weather']]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo['R3 Weather']}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo['R3 Weather']]}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
        </div>
    )
}

export default WeatherPanel;
