import './styles.scss';

const TableTooltip = ({ innerHtml, children, hangLeft = false }) => {
    const hangClass = hangLeft ? "table-tooltip__hang-left" : null;
    return (
        <div className="table-tooltip">
            {children}
            <div className={`table-tooltip__text ${hangClass}`}>
                {innerHtml}
            </div>
        </div>
    );
}

export default TableTooltip;
