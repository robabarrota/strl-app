import * as actions from './actions';

const INITIAL_STATE = {
	trackList: { loading: false, content: [], error: null },
	participants: { loading: false, content: [], error: null },
	qualifying: { loading: false, content: [], error: null },
	raceResults: { loading: false, content: [], error: null },
	fastestLaps: { loading: false, content: [], error: null },
	penalties: { loading: false, content: [], error: null },
	medalCount: { loading: false, content: [], error: null },
	highlights: { loading: false, content: [], error: null },
};

const reducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case actions.SET_TRACK_LIST:
			return { ...state, trackList: { ...state.trackList, ...action.payload.trackList } };
		case actions.SET_PARTICIPANTS:
			return { ...state, participants: { ...state.participants, ...action.payload.participants } };
		case actions.SET_QUALIFYING:
			return { ...state, qualifying: { ...state.qualifying, ...action.payload.qualifying } };
		case actions.SET_RACE_RESULTS:
			return { ...state, raceResults: { ...state.raceResults, ...action.payload.raceResults } };
		case actions.SET_FASTEST_LAPS:
			return { ...state, fastestLaps: { ...state.fastestLaps, ...action.payload.fastestLaps } };
		case actions.SET_PENALTIES:
			return { ...state, penalties: { ...state.penalties, ...action.payload.penalties } };
		case actions.SET_MEDAL_COUNT:
			return { ...state, medalCount: { ...state.medalCount, ...action.payload.medalCount } };
		case actions.SET_HIGHLIGHTS:
			return { ...state, highlights: { ...state.highlights, ...action.payload.highlights } };
            
		default:
			return state;
	}
};

export default reducer;
