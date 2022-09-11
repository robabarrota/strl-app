import { camelCase } from 'lodash';
import { carColorMap } from './constants';

const round = (number, decimalPlace = 2) => {
    const result = parseFloat(number).toFixed(decimalPlace);
    return !isNaN(result) ? result : number;
};

const getCarColor = (car, isPrimaryDriver, customOpacity = null) => {
    const {r, g, b} = carColorMap[camelCase(car)];
    const a = customOpacity === null ? isPrimaryDriver ? 1 : 0.75 : customOpacity;
    return `rgba(${r}, ${g}, ${b}, ${a})`
};


export {
    round, 
    getCarColor,
}