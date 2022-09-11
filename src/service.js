import { sheetConfig } from './utils/constants';
import { fetchGoogleSheetsData } from 'google-sheets-mapper';

const service = {
    getTrackList: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Track List' }],
    }),

    getParticipants: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Participants' }],
    }),
    
    getQualifying: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Qualifying' }],
    }),

    getRaceResults: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Race Results' }],
    }),
    
    getFastestLaps: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Fastest Lap' }],
    }),

    getMedalCount: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Medal Count' }],
    }),

    getHighlights: async () => await fetchGoogleSheetsData({
        ...sheetConfig,
        sheetsOptions: [{ id: 'Highlights' }],
    }),
}

export default service;