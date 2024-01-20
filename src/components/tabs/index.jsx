import React, { useCallback } from 'react';
import './styles.scss';
import useIsMobile from '@/hooks/useIsMobile';
import { cb } from '@/utils/utils';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const blockName = 'tabs';
const bem = cb(blockName);

const Glider = styled.span`
	position: absolute;
	display: flex;
	height: ${(props) => (props.$isMobile ? '24px' : '20px')};
	width: ${(props) => (props.$isMobile ? '60px' : '100px')};
	background-color: #e10600;
	z-index: 1;
	border-radius: 99px;
	transition: 0.25s ease-out;

	transform: translateX(${(props) => (props.$index || 0) * 100}%);
`;

const TabLabel = styled.label`
	display: flex;
	align-items: center;
	justify-content: center;
	height: ${(props) => (props.$isMobile ? '24px' : '20px')};
	width: ${(props) => (props.$isMobile ? '60px' : '100px')};
	font-size: 0.8rem;
	font-weight: 600;
	border-radius: 99px; // just a high number to create pill effect
	cursor: pointer;
	transition:
		color 0.15s ease-in,
		color 0.15s ease-out;
	text-transform: uppercase;
	${(props) => props.$isMobile && 'padding: 2px'};

	${(props) => (props.$selected ? 'color: #fff;' : '')};
`;

const Tabs = ({ tabs, activeTabIndex, onChange, useLinks }) => {
	const isMobile = useIsMobile();

	const renderTab = useCallback(
		(tabContent, index) => {
			if (useLinks) {
				return (
					<TabLabel
						key={`label-${index}`}
						htmlFor={`radio-${index}`}
						$selected={index === activeTabIndex}
						$isMobile={isMobile}
					>
						<Link to={tabContent.to}>{tabContent.label}</Link>
					</TabLabel>
				);
			}
			if (isMobile && tabContent.icon) {
				return (
					<TabLabel
						key={`label-${index}`}
						htmlFor={`radio-${index}`}
						$selected={index === activeTabIndex}
						$isMobile={isMobile}
					>
						<img className={bem('icon')} src={tabContent.icon} alt={'icon'} />
					</TabLabel>
				);
			}
			return (
				<TabLabel
					key={`label-${index}`}
					htmlFor={`radio-${index}`}
					$selected={index === activeTabIndex}
				>
					{tabContent.label}
				</TabLabel>
			);
		},
		[isMobile, activeTabIndex, useLinks]
	);

	return (
		<div className={blockName}>
			<div className={bem('container')}>
				<Glider $index={activeTabIndex} $isMobile={isMobile} />
				{tabs.map((content, index) => (
					<div key={content.label}>
						<input
							key={`input-${index}`}
							type="radio"
							id={`radio-${index}`}
							name="tabs"
							onChange={() => onChange && onChange(index)}
							checked={index === activeTabIndex}
						/>
						{renderTab(content, index)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Tabs;
