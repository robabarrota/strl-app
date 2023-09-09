import service from '@/service';
import * as actions from './actions';
import { camelize, camelizeKeys } from '@/utils/utils';

const fetchTrackList = (store, action) => {
	if (action.type === actions.FETCH_TRACK_LIST) {
		store.dispatch(actions.setTrackList({ loading: true }));
		service
			.getTrackList()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data)?.map(row => ({
					...row,
					key: camelize(row.track),
					label: row.track,
				}));

				store.dispatch(
					actions.setTrackList({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setTrackList({ loading: false, error, fetched: true }));
			});
	}
};

const fetchParticipants = (store, action) => {
	if (action.type === actions.FETCH_PARTICIPANTS) {
		store.dispatch(actions.setParticipants({ loading: true }));
		service
			.getParticipants()
			.then((response) => {
				const data = response[0].data?.map(row => ({
					driver: row['Driver'],
					car: row['Car'],
					isPrimary: row['Primary'] === 'TRUE',
				}));

				store.dispatch(
					actions.setParticipants({
						loading: false,
						content: data,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setParticipants({ loading: false, error, fetched: true }));
			});
	}
};

const fetchQualifying = (store, action) => {
	if (action.type === actions.FETCH_QUALIFYING) {
		store.dispatch(actions.setQualifying({ loading: true }));
		service
			.getQualifying()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setQualifying({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setQualifying({ loading: false, error, fetched: true }));
			});
	}
};

const fetchRaceResults = (store, action) => {
	if (action.type === actions.FETCH_RACE_RESULTS) {
		store.dispatch(actions.setRaceResults({ loading: true }));
		service
			.getRaceResults()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setRaceResults({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setRaceResults({ loading: false, error, fetched: true }));
			});
	}
};

const fetchFastestLaps = (store, action) => {
	if (action.type === actions.FETCH_FASTEST_LAPS) {
		store.dispatch(actions.setFastestLaps({ loading: true }));
		service
			.getFastestLaps()
			.then((response) => {
				const data = camelizeKeys(response[0].data)?.[0] || {};

				store.dispatch(
					actions.setFastestLaps({
						loading: false,
						content: data,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setFastestLaps({ loading: false, error, fetched: true }));
			});
	}
};

const fetchPenalties = (store, action) => {
	if (action.type === actions.FETCH_PENALTIES) {
		store.dispatch(actions.setPenalties({ loading: true }));
		service
			.getPenalties()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setPenalties({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setPenalties({ loading: false, error, fetched: true }));
			});
	}
};

const fetchMedalCount = (store, action) => {
	if (action.type === actions.FETCH_MEDAL_COUNT) {
		store.dispatch(actions.setMedalCount({ loading: true }));
		service
			.getMedalCount()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setMedalCount({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setMedalCount({ loading: false, error, fetched: true }));
			});
	}
};

const fetchHighlights = (store, action) => {
	if (action.type === actions.FETCH_HIGHLIGHTS) {
		store.dispatch(actions.setHighlights({ loading: true }));
		service
			.getHighlights()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setHighlights({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setHighlights({ loading: false, error, fetched: true }));
			});
	}
};

const fetchDriverPoints = (store, action) => {
	if (action.type === actions.FETCH_DRIVER_POINTS) {
		store.dispatch(actions.setDriverPoints({ loading: true }));
		service
			.getDriverPoints()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setDriverPoints({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setDriverPoints({ loading: false, error, fetched: true }));
			});
	}
};

const fetchDriverStats = (store, action) => {
	if (action.type === actions.FETCH_DRIVER_STATS) {
		store.dispatch(actions.setDriverStats({ loading: true }));
		service
			.getDriverStats()
			.then((response) => {
				const data = response[0].data;

				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setDriverStats({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setDriverStats({ loading: false, error, fetched: true }));
			});
	}
};

const fetchConstructorPoints = (store, action) => {
	if (action.type === actions.FETCH_CONSTRUCTOR_POINTS) {
		store.dispatch(actions.setConstructorPoints({ loading: true }));
		service
			.getConstructorPoints()
			.then((response) => {
				const data = response[0].data;
				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setConstructorPoints({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setConstructorPoints({ loading: false, error, fetched: true }));
			});
	}
};

const fetchConstructorStats = (store, action) => {
	if (action.type === actions.FETCH_CONSTRUCTOR_STATS) {
		store.dispatch(actions.setConstructorStats({ loading: true }));
		service
			.getConstructorStats()
			.then((response) => {
				const data = response[0].data;

				const formattedData = camelizeKeys(data);

				store.dispatch(
					actions.setConstructorStats({
						loading: false,
						content: formattedData,
						error: null,
						fetched: true
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setConstructorStats({ loading: false, error, fetched: true }));
			});
	}
};

const effects = [
	fetchTrackList, 
	fetchParticipants, 
	fetchQualifying, 
	fetchRaceResults, 
	fetchFastestLaps,
	fetchPenalties,
	fetchMedalCount,
	fetchHighlights,
	fetchDriverPoints,
	fetchDriverStats,
	fetchConstructorPoints,
	fetchConstructorStats,
];

export default effects;
