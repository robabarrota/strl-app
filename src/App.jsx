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

import { Navigate, ScrollRestoration, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{
				path: "schedule",
				element: <Schedule />,
			},
			{
				path: "drivers",
				element: <Drivers />,
			},
			{
				path: "driver/:driverName",
				element: <Driver />,
			},
			{
				path: "race-results",
				element: <RaceResults />,
			},
			{
				path: "qualifying",
				element: <Qualifying />,
			},
			{
				path: "standings",
				element: <Standings />,
			},
			{
				path: "medal-count",
				element: <MedalCount />,
			},
			{
				path: "statistics",
				element: <Statistics />,
			},
			{
				path: "highlights",
				element: <Highlights />,
			},
			{
				path: "penalties",
				element: <Penalties />,
			},
			{
				path: "/",
				element: <Navigate replace to="/race-results" />,
			},
			{
				path: "*",
				element: <NotFound />,
			},
		]
	},
	
]);

function Layout() {
	return (
		<>
			<Header />
			<div className="app">
				<div className='app__content-card'>
					<Outlet />
				</div>
			</div>
			<ScrollRestoration />
		</>
	);
  }
const App = () => {
	return <RouterProvider router={router} />
};

export default App;
