import { camelCase } from 'lodash';

const sheetKey = 'AIzaSyDPv1vWH_NZcLchfs36RetwSC1c99xkFm8';
const sheetId = '1r8vXuLNfUxgmRlQ67YKBzC6gc22irsdzlHI6DSyyWPc';

const constants = {

    mobileWidth: 920,

    sheetConfig: {
        apiKey: process.env.REACT_APP_LOCAL_SHEETS_API_KEY ?? sheetKey,
        sheetId: sheetId,
    },

    carAbbreviationMap: {
        'Mercedes': 'MER',
        'Red Bull': 'RB',
        'Ferrari': 'FER',
        'Racing Point': 'RP',
        'Williams': 'WIL',
        'Renault': 'REN',
        'McLaren': 'MCL',
        'Alfa Romeo': 'ALFA',
        'Alpha Tauri': 'ALPH',
        'Haas': 'HAAS',
    },

    trackAbbreviationMap: {
        'Australia': 'AUS',
        'Bahrain': 'BHR',
        'Vietnam': 'VNM',
        'China': 'CHN',
        'Netherlands': 'NLD',
        'Spain': 'ESP',
        'Monaco': 'MCO',
        'Azerbaijan': 'AZE',
        'Canada': 'CAN',
        'France': 'FRA',
        'Austria': 'AUT',
        'Britain': 'GBR',
        'Hungary': 'HUN',
        'Belgium': 'BEL',
        'Italy': 'ITA',
        'Singapore': 'SGP',
        'Russia': 'RUS',
        'Japan': 'JPN',
        'USA': 'USA',
        'Mexico': 'MEX',
        'Brazil': 'BRA',
        'Abu Dhabi': 'ABU',
    },

    carColorMap: {
        mercedesPrimary: 'rgba(0, 210, 190, 1)',
        mercedesSecondary: 'rgba(0, 210, 190, 0.75)',
        redBullPrimary: 'rgba(6, 0, 239, 1)',
        redBullSecondary: 'rgba(6, 0, 239, 0.75)',
        ferrariPrimary: 'rgba(192, 0, 0, 1)',
        ferrariSecondary: 'rgba(192, 0, 0, 0.75)',
        racingPointPrimary: 'rgba(245, 150, 200, 1)',
        racingPointSecondary: 'rgba(245, 150, 200, 0.75)',
        williamsPrimary: 'rgba(0, 130, 250, 1)',
        williamsSecondary: 'rgba(0, 130, 250, 0.75)',
        renaultPrimary: 'rgba(255, 245, 0, 1)',
        renaultSecondary: 'rgba(255, 245, 0, 0.75)',
        mclarenPrimary: 'rgba(255, 135, 0, 1)',
        mclarenSecondary: 'rgba(255, 135, 0, 0.75)',
        alfaRomeoPrimary: 'rgba(150, 0, 0, 1)',
        alfaRomeoSecondary: 'rgba(150, 0, 0, 0.75)',
        alphaTauriPrimary: 'rgba(200, 200, 200, 1)',
        alphaTauriSecondary: 'rgba(200, 200, 200, 0.75)',
        haasPrimary: 'rgba(120, 120, 120, 1)',
        haasSecondary: 'rgba(120, 120, 120, 0.75)',
    },

    getCarColor: (car, isPrimaryDriver) =>
        constants.carColorMap[`${camelCase(car)}${isPrimaryDriver ? 'Primary' : 'Secondary'}`],

    pointMap: {
        1: 25,
        2: 18,
        3: 15,
        4: 12,
        5: 10,
        6: 8,
        7: 6,
        8: 4,
        9: 2,
        10: 1,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,
        18: 0,
        19: 0,
        20: 0,
        21: 0,
        22: 0,
        'DNF': 0,
        'DNS': 0,
    },
}

export default constants;