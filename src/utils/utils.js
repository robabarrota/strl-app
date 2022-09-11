const utils = {
    round: (number, decimalPlace = 2) => {
        const result = parseFloat(number).toFixed(decimalPlace);
        return !isNaN(result) ? result : number;
    }
}

module.exports = utils;