import './styles.scss';
import React, {useMemo} from 'react';
import styled from 'styled-components';

const Face = styled.div`
    background-image: url('https://www.formula1.com/etc/designs/fom-website/images/rolex-clock/face.png');
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: contain;
    height: 100%;
    width: 100%;
    position: absolute;
`;
const Seconds = styled.div`
    background-image: url('https://www.formula1.com/etc/designs/fom-website/images/rolex-clock/second-hand.png');
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: contain;
    height: 100%;
    width: 100%;
    position: absolute;
    transform: rotate(${props => props.angle ?? 0}deg);
`;
const Minutes = styled.div`
    background-image: url('https://www.formula1.com/etc/designs/fom-website/images/rolex-clock/minute-hand.png');
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: contain;
    height: 100%;
    width: 100%;
    position: absolute;
    transform: rotate(${props => props.angle ?? 0}deg);
`;
const Hours = styled.div`
    background-image: url('https://www.formula1.com/etc/designs/fom-website/images/rolex-clock/hour-hand.png');
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: contain;
    height: 100%;
    width: 100%;
    position: absolute;
    transform: rotate(${props => props.angle ?? 0}deg);
`;
const Clock = ({ hours, minutes, seconds }) => {
    const secondAngle = useMemo(() => {
        const clockSeconds = 60 - seconds;
        return Math.round(clockSeconds / 60 * 360);
    }, [seconds])

    const minuteAngle = useMemo(() => {
        return Math.round(minutes / 60 * 360);
    }, [minutes])

    const hourAngle = useMemo(() => {
        let clockHours = hours;
        if (clockHours > 12) clockHours = clockHours - 12;
        return Math.round(clockHours / 12 * 360);
    }, [hours])

    return (
        <div className="clock">
            <Face>
                <Seconds angle={secondAngle} />
                <Minutes angle={minuteAngle} />
                <Hours angle={hourAngle} />
            </Face>
        </div>
        
    );
};

export default Clock;