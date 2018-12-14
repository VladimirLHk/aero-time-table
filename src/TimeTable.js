import React, { Component } from 'react';
import Control from "./Control";
import Table from "./Table";
import Base from "./Base";
import './App.css';

// Предполагается, что список рейсов статичен: ничего не исключается и ничего не добавляется

class TimeTable extends Component {
    constructor (props) {
        super (props);

        this.infoBase = new Base ({airportId: 3});

        this.state = {
            flowMode: true, //true = "показывать список рейсов на вылет", false = "показывать список рейсов на прилет"
            contentMode: true, //что включать в вывод: true = "все рейсы", false = "только задержанные"
            flightMask: "", //маска для фильтрации номеров рейса
            localTime: this.infoBase.getLocalTime() //массив: [0]-текущая дата в аэропорту [1]-текущее время в аэропорту
        };
        this.handleDirectionOnClick = this.handleDirectionOnClick.bind(this);
        this.handleContentOnClick = this.handleContentOnClick.bind(this);
        this.handleFilterInput = this.handleFilterInput.bind(this);
        this.handleChangeLocalTime = this.handleChangeLocalTime.bind(this);

    }

    handleDirectionOnClick (e) {
        const isDepart = this.state.flowMode;
        switch (e.target.id) {
            case "Depart":
                if (!isDepart) this.setState ({flowMode: true});
                break;
            case "Arrive":
                if (isDepart) this.setState ({flowMode: false});
                break;
        }
    }

    handleContentOnClick (value) {this.setState ({contentMode: !value})}

    handleFilterInput (filterStr) {this.setState ({flightMask: filterStr})}

    handleChangeLocalTime (e) {
        switch (e.target.id) {
            case "prev":
                this.infoBase.shiftAirportTime(-30);
                this.setState({localTime: this.infoBase.getLocalTime()});
                break;
            case "next":
                this.infoBase.shiftAirportTime(30);
                this.setState({localTime: this.infoBase.getLocalTime()});
                break;
        }
    }

    makeShowList () {
        return this.infoBase.getListToShow(this.state.flowMode, this.state.contentMode, this.state.flightMask)
    }

    render() {
        let localAPortName = this.infoBase.airports[this.infoBase.airportId];

        return (
            <div className="App">
                <Control
                    flowButtonsOnClick = {this.handleDirectionOnClick}
                    delayCheckBoxOnClick = {this.handleContentOnClick}
                    flowButtonPressed = {this.state.flowMode}
                    isAllFlight = {this.state.contentMode}
                    fltrValue = {this.state.flightMask}
                    setFltr = {this.handleFilterInput}
                    curDate = {this.state.localTime}
                    airportName = {localAPortName}
                    changeLocalTime = {this.handleChangeLocalTime}
                />
                <Table
                    tableToShow = {this.makeShowList()}
                    curFlow = {this.state.flowMode}
                />
            </div>
        );
    }
}

export default TimeTable;