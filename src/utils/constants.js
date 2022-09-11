const sheetKey = 'AIzaSyDPv1vWH_NZcLchfs36RetwSC1c99xkFm8';
const sheetId = '1r8vXuLNfUxgmRlQ67YKBzC6gc22irsdzlHI6DSyyWPc';

const mobileWidth = 920;

const sheetConfig = {
    apiKey: process.env.REACT_APP_LOCAL_SHEETS_API_KEY ?? sheetKey,
    sheetId: sheetId,
};

const carAbbreviationMap = {
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
};

const trackAbbreviationMap = {
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
};

const carColorMap = {
    mercedes: {
        r: 0,
        g: 210,
        b:  190
    },
    redBull: {
        r: 6,
        g: 0,
        b:  239
    },
    ferrari: {
        r: 192,
        g: 0,
        b:  0
    },
    racingPoint: {
        r: 245,
        g: 150,
        b:  200
    },
    williams: {
        r: 0,
        g: 130,
        b:  250
    },
    renault: {
        r: 219,
        g: 210,
        b:  0
    },
    mcLaren: {
        r: 255,
        g: 135,
        b:  0
    },
    alfaRomeo: {
        r: 150,
        g: 0,
        b:  0
    },
    alphaTauri: {
        r: 200,
        g: 200,
        b:  200
    },
    haas: {
        r: 120,
        g: 120,
        b:  120
    },
};

const pointMap = {
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
};

export {
    mobileWidth,
    sheetConfig,
    carAbbreviationMap,
    trackAbbreviationMap,
    carColorMap,
    pointMap,
};