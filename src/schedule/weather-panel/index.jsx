import './styles.scss';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { weatherIconMap, weatherColorMap } from '@/utils/constants';
import useIsMobile from '@/hooks/useIsMobile';

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

    transition: opacity 2s ease-in;
    -webkit-transition: opacity 2s ease-in;
    -moz-transition: opacity 2s ease-in;
    -ms-transition: opacity 2s ease-in;
    -o-transition: opacity 2s ease-in;
    opacity: 1;
    ${
        props => props.transitioning ? 
        `transition: opacity 2s ease-out;
        -webkit-transition: opacity 2s ease-out;
        -moz-transition: opacity 2s ease-out;
        -ms-transition: opacity 2s ease-out;
        -o-transition: opacity 2s ease-out;
        opacity: 0;` :
        '' 
    }
`;

const tbdWeatherIconTime = 2000;

const weatherIcons = Object.values(weatherIconMap);

const WeatherPanel = ({trackInfo}) => {
    const isMobile = useIsMobile();

	const [tbdWeatherIcon, setTbdWeatherIcon] = useState({iconIndex: 0, src: weatherIcons[0]});
	const [isTbdIconTransitioning, setIsTbdIconTransitioning] = useState(false);

    const qualifyingWeatherGradientStages = [
        weatherColorMap[trackInfo?.q1Weather],
        weatherColorMap[trackInfo?.q2Weather],
    ];
    const raceWeatherGradientStages = [
        weatherColorMap[trackInfo?.r1Weather],
        weatherColorMap[trackInfo?.r2Weather],
        weatherColorMap[trackInfo?.r3Weather],
    ];

    useEffect(() => {
        const timer1 = setTimeout(() => {
            if (isTbdIconTransitioning) {
                const nextIconIndex = (tbdWeatherIcon?.iconIndex + 1) % weatherIcons.length;
                const nextIconSrc = weatherIcons[nextIconIndex];
                setTbdWeatherIcon({iconIndex: nextIconIndex, src: nextIconSrc});
                setIsTbdIconTransitioning(false);
            } else {
                setIsTbdIconTransitioning(true);
            }
        }, tbdWeatherIconTime);
        return () => clearTimeout(timer1);
        
    }, [isTbdIconTransitioning, setIsTbdIconTransitioning, tbdWeatherIcon?.iconIndex])

	return (
        <div className="weather-panel">
            <Stint gradientStages={qualifyingWeatherGradientStages}>
                <Title>Qualifying</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo?.q1Weather || 'TBD'}</WeatherLabel>
                        <WeatherIcon transitioning={!weatherIconMap[trackInfo?.q1Weather] && isTbdIconTransitioning} src={weatherIconMap[trackInfo?.q1Weather] || tbdWeatherIcon.src}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.q2Weather || 'TBD'}</WeatherLabel>
                        <WeatherIcon transitioning={!weatherIconMap[trackInfo?.q2Weather] && isTbdIconTransitioning} src={weatherIconMap[trackInfo?.q2Weather] || tbdWeatherIcon.src}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
            <Stint gradientStages={raceWeatherGradientStages}>
                <Title>Race</Title>
                <WeatherRow>
                    <WeatherItem isMobile={isMobile} isFirst>
                        <WeatherLabel>{trackInfo?.r1Weather || 'TBD'}</WeatherLabel>
                        <WeatherIcon transitioning={!weatherIconMap[trackInfo?.r1Weather] && isTbdIconTransitioning} src={weatherIconMap[trackInfo?.r1Weather] || tbdWeatherIcon.src}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.r2Weather || 'TBD'}</WeatherLabel>
                        <WeatherIcon transitioning={!weatherIconMap[trackInfo?.r2Weather] && isTbdIconTransitioning} src={weatherIconMap[trackInfo?.r2Weather] || tbdWeatherIcon.src}/>
                    </WeatherItem>
                    <WeatherItem isMobile={isMobile}>
                        <WeatherLabel>{trackInfo?.r3Weather || 'TBD'}</WeatherLabel>
                        <WeatherIcon transitioning={!weatherIconMap[trackInfo?.r3Weather] && isTbdIconTransitioning} src={weatherIconMap[trackInfo?.r3Weather] || tbdWeatherIcon.src}/>
                    </WeatherItem>
                </WeatherRow>
            </Stint>
        </div>
    )
}

export default WeatherPanel;