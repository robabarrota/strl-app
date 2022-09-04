import './styles.scss';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useIsMobile from 'src/hooks/useIsMobile';
import React, { useState, useMemo } from 'react';

const Header = () => {
	const [navLinksOpen, setNavLinksOpen] = useState(false);
    const [showStandingsSublinks, setShowStandingsSublinks] = useState(false);
	const isMobile = useIsMobile();
	const location = useLocation();

	const expandedClass = useMemo(() => (navLinksOpen ? 'header__nav-sub-links--expanded' : ''), [navLinksOpen]);
	const labelClass = (isActive) => isActive ? 'header__nav-link-label header__nav-link--active' : 'header__nav-link-label header__nav-link--inactive';

	const closeHeader = () => {
		setNavLinksOpen(false);
		setShowStandingsSublinks(false);
	}
	const renderStandingsSubLinks = () => (
		showStandingsSublinks && 
		<div className={`header__nav-sub-links ${expandedClass}`}>
			<NavLink className="header__nav-link" to="/standings/driver" onClick={closeHeader}>
				{({ isActive }) => (
					<div className={labelClass(isActive)}>
						<span className='header__nav-link-text'>Driver Standings</span>
						<i className={"fa-solid fa-chevron-right header__chevron"}></i>
					</div>
				)}
			</NavLink>
			<NavLink className="header__nav-link" to="/standings/constructor" onClick={closeHeader}>
				{({ isActive }) => (
					<div className={labelClass(isActive)}>
						<span className='header__nav-link-text'>Constructor Standings</span>
						<i className={"fa-solid fa-chevron-right header__chevron"}></i>
					</div>
				)}
			</NavLink>
		</div>
	);

	const isStandingsUrl = useMemo(() => location.pathname.includes('/standings/'), [location]);

	return (
		<div 
			className="header" 
			onMouseLeave={() => setShowStandingsSublinks(false)}
		>
			<div className="header__top">
				<div className="header__responsive-bar">
					<Link className="header__title" to="/highlights" onClick={closeHeader}>
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
						<div className={labelClass(isStandingsUrl)}>
							<span className='header__nav-link-text'>Standings</span>
							<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							<i className={"fa-solid fa-chevron-down header__dropdown-chevron"}></i>
						</div>
					</a>
					{!isMobile && renderStandingsSubLinks()}
					<NavLink className="header__nav-link" to="/race-results" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Race Results</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/qualifying" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Qualifying</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/schedule" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Schedule</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/medal-count" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Leaders</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/highlights" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Highlights</span>
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
