import React, { Component } from 'react';
import './App.css';

class Control extends Component {

    constructor (props) {
        super(props);

        this.state = {filtrValue: ""};

        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.onChangeCheckBox = this.onChangeCheckBox.bind(this);
    }

    onChangeCheckBox (e) {
        this.props.delayCheckBoxOnClick (e.target.checked);
    }

    onChangeFilter (e) {
        let filterStr = e.target.value.match(/\d+/g);
        if (filterStr === null) filterStr = '';
        this.setState({filtrValue:filterStr});
        this.props.setFltr (filterStr);
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
                <p><input id="fiNumFltr" type="text" value={this.state.filtrValue} placeholder="Поиск по номеру рейса" onChange={this.onChangeFilter}/>
                    &emsp;
                    <button id="fltrErase" onClick={this.props.eraseFltr}>x</button>
                </p>
            </div>
        );
    }
}

export default Control;
