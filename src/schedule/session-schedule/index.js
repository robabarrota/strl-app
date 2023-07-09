import './styles.scss';
import React from 'react';
import styled from 'styled-components';

const MiscLabel = styled.p`
    margin: 0;
    text-align: center;
    font-family: "Titillium Web";
    font-size: 13px;
    line-height: 15px;
    letter-spacing: .5px;
    font-weight: 400;
    color: #fff;
`;

const SessionList = styled.div`
    margin-bottom: 10px;
    color: #fff;
`;

const SessionItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    ${props => props.isPractice ? `
        padding-bottom: 5px;
        border-bottom: 2px solid #38383f;
        margin-bottom: 5px;
    ` : ''}
`;

const SessionSchedule = () => {
    return (
        <div className="session-schedule">
            <SessionList>
                <SessionItem isPractice>
                    <div className="session-schedule__name">Practice</div>
                    <div className="session-schedule__day">Wed</div>
                    <div className="session-schedule__time">20:30</div>
                </SessionItem>
                <SessionItem>
                    <div className="session-schedule__name">Qualifying</div>
                    <div className="session-schedule__day">Wed</div>
                    <div className="session-schedule__time">21:30</div>
                </SessionItem>
                <SessionItem>
                    <div className="session-schedule__name">Race</div>
                    <div className="session-schedule__day">Wed</div>
                    <div className="session-schedule__time">21:48</div>
                </SessionItem>
            </SessionList>
            <MiscLabel>Times displayed are EST</MiscLabel>
        </div>
    );
};

export default SessionSchedule;