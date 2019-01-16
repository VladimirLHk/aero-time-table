import React, { Component } from 'react';
import './App.css';
import Table from "./Table";

class Control extends Component {
    constructor(props) {
        super(props);

        this.airportName = "";
        this.isInit = false;
        this.state = {};

        this.setInitState = this.setInitState.bind(this);

        this.setFlowModeState = this.setFlowModeState.bind(this);
        this.flowButtonsOnClick = this.flowButtonsOnClick.bind(this);

        this.setAllFlagState = this.setAllFlagState.bind(this);
        this.onChangeCheckBox = this.onChangeCheckBox.bind(this);

        this.setFltrValueState = this.setFltrValueState.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.eraseFilter = this.eraseFilter.bind(this);

        this.props.loadData (this.setInitState,"");

    }

    setInitState () {
        this.timeTable = this.props.getTimeTable(true, true, "", 3);
        this.airportName = this.props.getAirportName(3);
        this.isInit = true;
        this.setState ({
            flowMode: true, //true = "показывать список рейсов на вылет", false = "показывать список рейсов на прилет"
            contentMode: true, //что включать в вывод: true = "все рейсы", false = "только задержанные"
            fltrValue: "", //маска для фильтрации номеров рейса
            airportId:3 //индекс местного аэропорта в списке всех аэропортов
        });
    }

    setFlowModeState (param) {
        console.log(2);
        let allFlag = this.state.contentMode;
        let flightFiltr = this.state.fltrValue;
        let localAPrtId = this.state.airportId;

        this.timeTable = this.props.getTimeTable(param, allFlag, flightFiltr, localAPrtId);
        this.setState ({flowMode: param});
        console.log(3);
    }

    flowButtonsOnClick(e) {
        const isDepart = this.state.flowMode;
        switch (e.target.id) {
            case "Depart":
                if (!isDepart) this.props.loadData(this.setFlowModeState,true);
                break;
            case "Arrive":
                if (isDepart) this.props.loadData(this.setFlowModeState,false);
                break;
            default: break;
        }

    }

    setAllFlagState (param) {
        let flowFlag = this.state.flowMode;
        let flightFiltr = this.state.fltrValue;
        let localAPrtId = this.state.airportId;

        this.timeTable = this.props.getTimeTable(flowFlag, !param, flightFiltr, localAPrtId);
        this.setState ({contentMode: !param});
    }


    onChangeCheckBox(e) {
        this.props.loadData(this.setAllFlagState, e.target.checked);
    }

    setFltrValueState (param) {
        let flowFlag = this.state.flowMode;
        let allFlag = this.state.contentMode;
        let localAPrtId = this.state.airportId;

        this.timeTable = this.props.getTimeTable(flowFlag, allFlag, param, localAPrtId);
        this.setState ({fltrValue: param});
    }
    onChangeFilter(e) {
        let filterStr = e.target.value.match(/\d+/g);
        if (filterStr === null) filterStr = '';
        this.props.loadData(this.setFltrValueState, filterStr);
    }

    eraseFilter(e) {
        this.props.loadData(this.setFltrValueState, "");
    }

    render() {
        console.log(4);
        if(this.isInit) {
            let departClassName = this.state.flowMode ? "pressedBut" : "unpressedBut";
            let arriveClassName = this.state.flowMode ? "unpressedBut" : "pressedBut";
            return (
                <div className="Ctrl">
                    <h2>Табло аэропорта: {this.airportName}</h2>
                    <button id="Depart" className={departClassName} onClick={this.flowButtonsOnClick}>Вылет</button>
                    <span>&emsp;&emsp;</span>
                    <button id="Arrive" className={arriveClassName} onClick={this.flowButtonsOnClick}>Прилет</button>
                    <p><input id="allFl" type="checkbox" defaultChecked={!this.state.contentMode}
                              onChange={this.onChangeCheckBox}/> Показывать только задержанные рейсы </p>
                    <p><input id="flNumFltr" type="text" value={this.state.fltrValue} placeholder="Поиск по номеру рейса" onChange={this.onChangeFilter}/>
                        &emsp;
                        <button id="fltrErase" onClick={this.eraseFilter}>x</button>
                    </p>
                    <Table
                        tableToShow = {this.timeTable}
                        curFlow = {this.state.flowMode}
                    />
                </div>
            );
        } else {
            return <p>Waiting ...</p>
        }
    }
}
export default Control;
