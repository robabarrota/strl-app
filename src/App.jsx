import './App.scss';
import Header from './header';
import Qualifying from './qualifying/index';
import Schedule from './schedule/index';
import RaceResults from './race-results/index';
import MedalCount from './medal-count/index';
import Highlights from './highlights/index';
import NotFound from './not-found';
import Penalties from './penalties/index';
import Standings from './standings/index';
import Statistics from './statistics/index';
import Drivers from './drivers/index';
import Driver from './driver/index';

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
	return (
		<HashRouter baseline='/'>
			<Header />
			<div className="app">
				<div className='app__content-card'>
					<Routes>
						<Route path="schedule" element={<Schedule />} />
						<Route path="drivers" element={<Drivers />} />
						<Route path="driver/:driverName" element={<Driver />} />
						<Route path="race-results" element={<RaceResults />} />
						<Route path="qualifying" element={<Qualifying />} />
						<Route path="standings" element={<Standings />} />
						<Route path="medal-count" element={<MedalCount />} />
						<Route path="statistics" element={<Statistics />} />
						<Route path="highlights" element={<Highlights />} />
						<Route path="penalties" element={<Penalties />} />
						<Route exact path="/" element={<Navigate replace to="/race-results" />}/>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</div>
			</div>

		</HashRouter>
	);
};

export default App;
