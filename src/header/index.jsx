import './styles.scss';
import { Link, NavLink } from 'react-router-dom';
import React, { useState, useMemo } from 'react';

const Header = () => {
	const [navLinksOpen, setNavLinksOpen] = useState(false);

	const expandedClass = useMemo(() => (navLinksOpen ? 'header__nav-sub-links--expanded' : ''), [navLinksOpen]);
	const labelClass = (isActive) => isActive ? 'header__nav-link-label header__nav-link--active' : 'header__nav-link-label header__nav-link--inactive';

	const closeHeader = () => {
		setNavLinksOpen(false);
	}

	return (
		<div 
			className="header" 
		>
			<div className="header__top">
				<div className="header__responsive-bar">
					<Link className="header__title" to="/" onClick={closeHeader}>
						STRL
					</Link>

					<button className="header__burger-menu" onClick={() => setNavLinksOpen(!navLinksOpen)}>
						<i className="fa fa-bars"></i>
					</button>
				</div>

				<div className={`header__nav-links${expandedClass}`}>
					<NavLink className="header__nav-link" to="/standings" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Standings</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
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
					<NavLink className="header__nav-link" to="/penalties" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Penalties</span>
								<i className={"fa-solid fa-chevron-right header__chevron"}></i>
							</div>
						)}
					</NavLink>
					<NavLink className="header__nav-link" to="/statistics" onClick={closeHeader}>
						{({ isActive }) => (
							<div className={labelClass(isActive)}>
								<span className='header__nav-link-text'>Statistics</span>
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
		</div>
	);
}

export default Header;
