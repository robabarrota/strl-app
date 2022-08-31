import {first} from 'lodash';
import service from 'src/service';
import * as actions from './actions';

const fetchTrackList = (store, action) => {
	if (action.type === actions.FETCH_TRACK_LIST) {
		store.dispatch(actions.setTrackList({ loading: true }));
		service
			.getTrackList()
			.then((response) => {
				const data = response[0].data;

				store.dispatch(
					actions.setTrackList({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setTrackList({ loading: false, error }));
			});
	}
};

const fetchParticipants = (store, action) => {
	if (action.type === actions.FETCH_PARTICIPANTS) {
		store.dispatch(actions.setParticipants({ loading: true }));
		service
			.getParticipants()
			.then((response) => {
				const data = response[0].data;

				store.dispatch(
					actions.setParticipants({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setParticipants({ loading: false, error }));
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

				store.dispatch(
					actions.setQualifying({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setQualifying({ loading: false, error }));
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

				store.dispatch(
					actions.setRaceResults({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setRaceResults({ loading: false, error }));
			});
	}
};

const fetchFastestLaps = (store, action) => {
	if (action.type === actions.FETCH_FASTEST_LAPS) {
		store.dispatch(actions.setFastestLaps({ loading: true }));
		service
			.getFastestLaps()
			.then((response) => {
				const data = first(response[0].data);

				store.dispatch(
					actions.setFastestLaps({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setFastestLaps({ loading: false, error }));
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

				store.dispatch(
					actions.setMedalCount({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setMedalCount({ loading: false, error }));
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

				store.dispatch(
					actions.setHighlights({
						loading: false,
						content: data,
						error: null,
					}),
				);
			})
			.catch((error) => {
				store.dispatch(actions.setHighlights({ loading: false, error }));
			});
	}
};

const effects = [
	fetchTrackList, 
	fetchParticipants, 
	fetchQualifying, 
	fetchRaceResults, 
	fetchFastestLaps, 
	fetchMedalCount,
	fetchHighlights
];

export default effects;
