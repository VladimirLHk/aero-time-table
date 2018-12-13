import React, { Component } from 'react';
import Control from "./Control";
import Table from "./Table";
import Base from "./Base";
import './App.css';

/*
Предполагается, что
- входные данные могут быть "немного битыми": достаточность проверок на полноту и непротиворечивость ещё надо оценить
- список рейсов статичен: ничего не исключается и ничего не добавляется
 */

class TimeTable extends Component {
    constructor (props) {
        super (props);

        //загрузить справочники: аэропорты, авиакомпании, рейсы

        this.state = {
            flowMode: true, //true = "показывать список рейсов на вылет", false = "показывать список рейсов на прилет"
            contentMode: true, //что включать в вывод: true = "все рейсы", false = "только задержанные"
            flightMask: "" //маска для фильтрации номеров рейса
        };

        this.infoBase = new Base ({airportId: 3});
        this.handleDirectionOnClick = this.handleDirectionOnClick.bind(this);
        this.handleContentOnClick = this.handleContentOnClick.bind(this);
        this.handleFilterInput = this.handleFilterInput.bind(this);
        this.handleFilterErase = this.handleFilterErase.bind(this);

    }

    handleDirectionOnClick (e) {
        const isDepart = this.state.flowMode;
        const isAll = this.state.contentMode;
        const fMask = this.state.flightMask;

        switch (e.target.id) {
            case "Depart":
                if (!isDepart){
                    this.setState ({
                        flowMode: true,
                        contentMode: isAll,
                        flightMask: fMask
                    });
                }
                break;
            case "Arrive":
                if (isDepart) {
                    this.setState ({
                        flowMode: false,
                        contentMode: isAll,
                        flightMask: fMask
                    });
                }
                break;
        }
    }

    handleContentOnClick (value) {
        const isDepart = this.state.flowMode;
        const isAll = !value;
        const fMask = this.state.flightMask;

        this.setState ({
            flowMode: isDepart,
            contentMode: isAll,
            flightMask: fMask
        });
    }

    handleFilterInput (filterStr) {
        const isDepart = this.state.flowMode;
        const isAll = this.state.contentMode;
        const fMask = filterStr;

        this.setState ({
            flowMode: isDepart,
            contentMode: isAll,
            flightMask: fMask
        });
    }

    handleFilterErase (e) {
        const isDepart = this.state.flowMode;
        const isAll = this.state.contentMode;
        const fMask = "";

        this.setState ({
            flowMode: isDepart,
            contentMode: isAll,
            flightMask: fMask
        });
//        this.makeShowList();

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
                    eraseFltr = {this.handleFilterErase}
                />
                <Table
                    tableToShow = {this.makeShowList()}
                    curDate = {this.infoBase.now.toString()}
                    curFlow = {this.state.flowMode}
                    airportName = {localAPortName}
                />
            </div>
        );
    }
}

export default TimeTable;

