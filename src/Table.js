import React, { Component } from 'react';
import './App.css';

class Table extends Component {
    render() {
        const table = this.props.tableToShow; //таблица для отображения
        const tabHeight = table.length;
        const tabColNum = 6; //число колонок в таблице
        const curFlow = this.props.curFlow; //"отображать вылетающие рейсы?"
        const dataHead = curFlow ? "Дата вылета" : "Дата прилета";
        const dataTime = curFlow ? "Время вылета" : "Время прилета";
        let picture;

        if (tabHeight === 0) picture = <p>Нет рейсов для отображения</p>;
        else {
            let timeTableHead = <tr key='r0'>
                <th key={'r0c0'}>Аэропорт</th>
                <th key={'r0c1'}>Авиакомпания</th>
                <th key={'r0c2'}>Номер рейса</th>
                <th key={'r0c3'}>{dataHead}</th>
                <th key={'r0c4'}>{dataTime}</th>
                <th width="10em" key={'r0c5'}>Информация</th>
            </tr>;
            let tableToPicture = [timeTableHead];
            for (let i=0;i<tabHeight;i++) {
                let tabRow = [];
                let rowClass = table[i][7] ? "flightDelay" : "flightInTime";
                rowClass += i%2 ? "" : " oddRow";
                for (let j = 0; j < tabColNum; j++) tabRow.push(<td className={rowClass} key={'r'+(i+1)+'c'+j}>{table[i][j]}</td>);
                tableToPicture.push(<tr key={'r'+(i+1)}>{tabRow}</tr>);
            }

            picture = <table className="TimeTable"><tbody>{tableToPicture}</tbody></table>

        }

        return (
            <div className="Ctrl">
                {picture}
            </div>
        );
    }
}

export default Table;
