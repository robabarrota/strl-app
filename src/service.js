import constants from './utils/constants';
import { fetchGoogleSheetsData } from 'google-sheets-mapper';

const service = {
    getTrackList: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Track List' }],
    }),

    getParticipants: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Participants' }],
    }),
    
    getQualifying: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Qualifying' }],
    }),

    getRaceResults: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Race Results' }],
    }),
    
    getFastestLaps: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Fastest Lap' }],
    }),

    getMedalCount: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Medal Count' }],
    }),

    getHighlights: async () => await fetchGoogleSheetsData({
        ...constants.sheetConfig,
        sheetsOptions: [{ id: 'Highlights' }],
    }),
}

export default service;