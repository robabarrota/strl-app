import './styles.scss';
import styled from 'styled-components';

const Glider = styled.span`
    position: absolute;
    display: flex;
    height: 20px;
    width: 100px;
    background-color: #e10600;
    z-index: 1;
    border-radius: 99px;
    transition: 0.25s ease-out;
    
    transform: translateX(${({index}) => (index || 0) * 100}%);
`

const Tab = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    width: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 99px; // just a high number to create pill effect
    cursor: pointer;
    transition: color 0.15s ease-in, color 0.15s ease-out;
    text-transform: uppercase;
    
    ${({selected}) => selected ? 'color: #fff;' : ''};
`
const Tabs = ({ tabs, activeTabIndex, onChange }) => {
    return (
        <div className="tabs">
            <div className="tabs__container">
                <Glider index={activeTabIndex} />
                {tabs.map((label, index) => (
                    <div key={label}>
                        <input 
                            key={`input-${index}`} 
                            type="radio" 
                            id={`radio-${index}`}
                            name="tabs" 
                            onChange={() => onChange(index)} 
                            checked={index === activeTabIndex}
                        />
                        <Tab 
                            key={`label-${index}`} 
                            htmlFor={`radio-${index}`}
                            selected={index === activeTabIndex}
                        >
                            {label}
                        </Tab>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tabs;
