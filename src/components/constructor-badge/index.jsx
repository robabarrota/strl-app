import './styles.scss';
import { carAbbreviationMap } from '@/utils/constants';

const ConstructorBadge = ({ constructor }) => {

    const abbreviation = carAbbreviationMap[constructor];
    const abbrevClass = `constructor-badge__${abbreviation?.toLowerCase()}`;

    return (
        <div className={`constructor-badge ${abbrevClass}`}>
            {abbreviation}
        </div>
    );
}

export default ConstructorBadge;
