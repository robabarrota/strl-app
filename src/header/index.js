import './styles.scss';
import { Link, NavLink } from 'react-router-dom';
import useIsMobile from 'src/hooks/useIsMobile';
import React, { useState, useMemo } from 'react';

const Header = () => {
	const [navLinksOpen, setNavLinksOpen] = useState(false);
    const [showStandingsSublinks, setShowStandingsSublinks] = useState(false);
	const isMobile = useIsMobile();

	const expandedClass = useMemo(() => (navLinksOpen ? 'header__nav-sub-links--expanded' : ''), [navLinksOpen]);
	const labelClass = (isActive) => isActive ? 'header__nav-link-label header__nav-link--active' : 'header__nav-link-label header__nav-link--inactive';

	const renderStandingsSubLinks = () => (
		showStandingsSublinks && 
		<div className={`header__nav-sub-links ${expandedClass}`}>
			<NavLink className="header__nav-link" to="/standings/driver">
				{({ isActive }) => (
					<div className={labelClass(isActive)}>
						<span className='header__nav-link-text'>Driver Standings</span>
						<i className={"fa-solid fa-chevron-right header__chevron"}></i>
					</div>
				)}
			</NavLink>
			<NavLink className="header__nav-link" to="/standings/constructor">
				{({ isActive }) => (
					<div className={labelClass(isActive)}>
						<span className='header__nav-link-text'>Constructor Standings</span>
						<i className={"fa-solid fa-chevron-right header__chevron"}></i>
					</div>
				)}
			</NavLink>
		</div>
	);
	return (
		<div 
			className="header" 
			onMouseLeave={() => setShowStandingsSublinks(false)}
		>
			<div className="header__top">
				<div className="header__responsive-bar">
					<Link className="header__title" to="/">
						STRL
					</Link>

					<button className="header__burger-menu" onClick={() => setNavLinksOpen(!navLinksOpen)}>
						<i className="fa fa-bars"></i>
					</button>
				</div>

				<div className={`header__nav-links${expandedClass}`}>
					<a 
						className="header__nav-link" 
						onMouseEnter={() => setShowStandingsSublinks(true)}
						onTouchStart={() => setShowStandingsSublinks(!showStandingsSublinks)}
					>
						<div className={labelClass(false)}>
							<span className='header__nav-link-text'>Standings</span>
							<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							<i className={"fa-solid fa-chevron-down header__dropdown-chevron"}></i>
						</div>
					</a>
					{!isMobile && renderStandingsSubLinks()}
					<NavLink className="header__nav-link" to="/race-results">
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Race Results</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/qualifying">
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Qualifying</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/schedule">
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Schedule</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/medal-count">
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>League Leaders</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
				</div>
			</div>
			{isMobile && renderStandingsSubLinks()}
		</div>
	);
}

export default Header;
