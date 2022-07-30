import * as actions from './actions';

const INITIAL_STATE = {
	trackList: { loading: false, content: [], error: null },
	qualifying: { loading: false, content: [], error: null },
};

const reducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case actions.SET_TRACK_LIST:
			return { ...state, trackList: { ...state.trackList, ...action.payload.trackList } };
		case actions.SET_QUALIFYING:
			return { ...state, qualifying: { ...state.qualifying, ...action.payload.qualifying } };
            
		default:
			return state;
	}
};

export default reducer;