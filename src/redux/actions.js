const prefix = 'sheets-store';

export const SET_TRACK_LIST = `${prefix}/SET_TRACK_LIST`;
export const setTrackList = trackList => ({ type: SET_TRACK_LIST, payload: { trackList } });

export const FETCH_TRACK_LIST = `${prefix}/FETCH_TRACK_LIST`;
export const fetchTrackList = () => ({ type: FETCH_TRACK_LIST });

export const SET_PARTICIPANTS = `${prefix}/SET_PARTICIPANTS`;
export const setParticipants = participants => ({ type: SET_PARTICIPANTS, payload: { participants } });

export const FETCH_PARTICIPANTS = `${prefix}/FETCH_PARTICIPANTS`;
export const fetchParticipants = () => ({ type: FETCH_PARTICIPANTS });

export const SET_QUALIFYING = `${prefix}/SET_QUALIFYING`;
export const setQualifying = qualifying => ({ type: SET_QUALIFYING, payload: { qualifying } });

export const FETCH_QUALIFYING = `${prefix}/FETCH_QUALIFYING`;
export const fetchQualifying = () => ({ type: FETCH_QUALIFYING });

export const SET_RACE_RESULTS = `${prefix}/SET_RACE_RESULTS`;
export const setRaceResults = raceResults => ({ type: SET_RACE_RESULTS, payload: { raceResults } });

export const FETCH_RACE_RESULTS = `${prefix}/FETCH_RACE_RESULTS`;
export const fetchRaceResults = () => ({ type: FETCH_RACE_RESULTS });

export const SET_FASTEST_LAPS = `${prefix}/SET_FASTEST_LAPS`;
export const setFastestLaps = fastestLaps => ({ type: SET_FASTEST_LAPS, payload: { fastestLaps } });

export const FETCH_FASTEST_LAPS = `${prefix}/FETCH_FASTEST_LAPS`;
export const fetchFastestLaps = () => ({ type: FETCH_FASTEST_LAPS });

export const SET_MEDAL_COUNT = `${prefix}/SET_MEDAL_COUNT`;
export const setMedalCount = medalCount => ({ type: SET_MEDAL_COUNT, payload: { medalCount } });

export const FETCH_MEDAL_COUNT = `${prefix}/FETCH_MEDAL_COUNT`;
export const fetchMedalCount = () => ({ type: FETCH_MEDAL_COUNT });
