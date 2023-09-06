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
        weatherColorMap[trackInfo?.q1Weather],
        weatherColorMap[trackInfo?.q2Weather],
    ];
    const raceWeatherGradientStages = [
        weatherColorMap[trackInfo?.r1Weather],
        weatherColorMap[trackInfo?.r2Weather],
        weatherColorMap[trackInfo?.r3Weather],
    ];
	return (
        <div className="weather-panel">
            <Stint gradientStages={qualifyingWeatherGradientStages}>
                <Title>Qualifying</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo?.q1Weather}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo?.q1Weather]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.q2Weather}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo?.q2Weather]}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
            <Stint gradientStages={raceWeatherGradientStages}>
                <Title>Race</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo?.r1Weather}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo?.r1Weather]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.r2Weather}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo?.r2Weather]}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.r3Weather}</WeatherLabel>
                        <WeatherIcon src={weatherIconMap[trackInfo?.r3Weather]}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
        </div>
    )
}

export default WeatherPanel;
