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
    'McLaren': 'MCL',
    'Alpine': 'ALP',
    'AlphaTauri': 'ALPH',
    'Aston Martin': 'AST',
    'Williams': 'WILL',
    'Alfa Romeo': 'ALFA',
    'Haas': 'HAAS',
};

const trackDetails = {
    'Australia': {
        abbreviation: 'AUS',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/australia-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Australia%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HEINEKEN AUSTRALIAN GRAND PRIX',
    },
    'Bahrain': {
        abbreviation: 'BHR',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/bahrain-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Bahrain%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 GULF AIR BAHRAIN GRAND PRIX',
    },
    'China': {
        abbreviation: 'CHN',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/china-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/China%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HEINEKEN CHINESE GRAND PRIX',
    },
    'Netherlands': {
        abbreviation: 'NLD',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/netherlands-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Netherlands%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HEINEKEN DUTCH GRAND PRIX',
    },
    'Spain': {
        abbreviation: 'ESP',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/spain-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 PIRELLI GRAN PREMIO DE ESPAÑA',
    },
    'Monaco': {
        abbreviation: 'MCO',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/monaco-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Monaco%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 GRAND PRIX DE MONACO',
    },
    'Azerbaijan': {
        abbreviation: 'AZE',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/azerbaijan-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Azerbaijan%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 AZERBAIJAN GRAND PRIX',
    },
    'Canada': {
        abbreviation: 'CAN',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/canada-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Canada%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 AWS GRAND PRIX DU CANADA',
    },
    'France': {
        abbreviation: 'FRA',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/france-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/France%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 LENOVO GRAND PRIX DE FRANCE',
    },
    'Austria': {
        abbreviation: 'AUT',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/austria-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Austria%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 ROLEX GROSSER PREIS VON ÖSTERREICH',
    },
    'Great Britain': {
        abbreviation: 'GBR',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/great-britain-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Great%20Britain%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 LENOVO BRITISH GRAND PRIX',
    },
    'Hungary': {
        abbreviation: 'HUN',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/hungary-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Hungary%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 ARAMCO MAGYAR NAGYDÍJ',
    },
    'Belgium': {
        abbreviation: 'BEL',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/belgium-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Belgium%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 ROLEX BELGIAN GRAND PRIX',
    },
    'Italy': {
        abbreviation: 'ITA',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/italy-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Italy%20carbon.png.transform/2col/image.png',
        fullName: `FORMULA 1 PIRELLI GRAN PREMIO D'ITALIA`,
    },
    'Singapore': {
        abbreviation: 'SGP',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/singapore-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Singapore%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX',
    },
    'Japan': {
        abbreviation: 'JPN',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/japan-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Japan%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HONDA JAPANESE GRAND PRIX',
    },
    'USA': {
        abbreviation: 'USA',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/united-states-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/United%20States%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 ARAMCO UNITED STATES GRAND PRIX',
    },
    'Mexico': {
        abbreviation: 'MEX',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/mexico-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Mexico%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO',
    },
    'Brazil': {
        abbreviation: 'BRA',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/brazil-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Brazil%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HEINEKEN GRANDE PRÊMIO DE SÃO PAULO',
    },
    'Abu Dhabi': {
        abbreviation: 'ABU',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/abu-dhabi-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Abu%20Dhabi%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 ETIHAD AIRWAYS ABU DHABI GRAND PRIX',
    },
    'Emilia Romagna': {
        abbreviation: 'EMI',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/italy-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Emilia%20Romagna%20carbon.png.transform/2col/image.png',
        fullName: `FORMULA 1 ROLEX GRAN PREMIO DEL MADE IN ITALY E DELL'EMILIA-ROMAGNA`,
    },
    'Miami': {
        abbreviation: 'MIA',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/united-states-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Miami%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 CRYPTO.COM MIAMI GRAND PRIX',
    },
    'Portugal': {
        abbreviation: 'POR',
        flag: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/portugal-flag.png.transform/2col/image.png',
        map: 'https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Portugal%20carbon.png.transform/2col/image.png',
        fullName: 'FORMULA 1 HEINEKEN GRANDE PRÉMIO DE PORTUGAL',
    },
};

const carColorMap = {
    mercedes: {
        r: 108,
        g: 211,
        b: 191
    },
    redBull: {
        r: 30,
        g: 91,
        b: 198
    },
    ferrari: {
        r: 237,
        g: 28,
        b: 36
    },
    mcLaren: {
        r: 245,
        g: 128,
        b: 32
    },
    alpine: {
        r: 34,
        g: 147,
        b: 209
    },
    alphaTauri: {
        r: 78,
        g: 124,
        b: 155
    },
    astonMartin: {
        r: 45,
        g: 130,
        b: 109
    },
    williams: {
        r: 55,
        g: 190,
        b: 221
    },
    alfaRomeo: {
        r: 172,
        g: 32,
        b: 57
    },
    haas: {
        r: 182,
        g: 186,
        b: 189
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
    trackDetails,
    carColorMap,
    pointMap,
};