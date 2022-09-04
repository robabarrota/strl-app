import './styles.scss';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
	return (
		<div className="not-found">
			<div className="not-found__content">
				<p>Looks like you spun out <i class="fa-solid fa-road-circle-exclamation"></i></p>

				<Link to="/" className='not-found__link'>
					Get back on track
				</Link>				
			</div>
		</div>
	);

}

export default NotFound;
