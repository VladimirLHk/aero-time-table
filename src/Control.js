import React, { Component } from 'react';
import './App.css';

class Control extends Component {

    constructor (props) {
        super(props);

        this.state = {fltrValue: ""};

        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.eraseFilter = this.eraseFilter.bind(this);
        this.onChangeCheckBox = this.onChangeCheckBox.bind(this);
    }

    onChangeCheckBox (e) {
        this.props.delayCheckBoxOnClick (e.target.checked);
    }

    onChangeFilter (e) {
        let filterStr = e.target.value.match(/\d+/g);
        if (filterStr === null) filterStr = '';
        this.setState({fltrValue:filterStr});
        this.props.setFltr (filterStr);
    }

    eraseFilter (e) {
        this.setState({fltrValue:""});
        this.props.setFltr ("");
    }

    render() {
        let departClassName = this.props.flowButtonPressed ? "pressedBut" : "unpressedBut";
        let arriveClassName = this.props.flowButtonPressed ? "unpressedBut" : "pressedBut";

        return (
            <div className="Ctrl">
                <button id="Depart" className={departClassName} onClick={this.props.flowButtonsOnClick}>Вылет</button>
                <span>&emsp;&emsp;</span>
                <button id="Arrive" className={arriveClassName} onClick={this.props.flowButtonsOnClick}>Прилет</button>
                <p><input id="allFl" type="checkbox" defaultChecked={!this.props.isAllFlight} onChange={this.onChangeCheckBox}/> Показывать только задержанные рейсы </p>
                <p><input id="fiNumFltr" type="text" value={this.state.fltrValue} placeholder="Поиск по номеру рейса" onChange={this.onChangeFilter}/>
                    &emsp;
                    <button id="fltrErase" onClick={this.eraseFilter}>x</button>
                </p>
                <p>Табло аэропорта: {this.props.airportName}</p>
                <p>Сегодня: {this.props.curDate[0]}</p>
                <p>Cейчас:
                    <span>
                        &emsp;
                        <button id="prev" onClick={this.props.changeLocalTime}>-30 m</button>
                        &emsp;
                    </span>
                    {this.props.curDate[1]}
                    <span>
                        &emsp;
                        <button id="next" onClick={this.props.changeLocalTime}>+30 m</button>
                        &emsp;
                    </span>
                </p>
            </div>
        );
    }
}

export default Control;
