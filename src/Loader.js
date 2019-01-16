import React, { Component } from 'react';
import $ from "jquery";
import Control from "./Control";
import './App.css';

class SkyManager extends Component {
    constructor(props) {
        super(props);

        this.isLoadOK = false; //true - данные загрузились,

        this.now = new Date(2018, 11, 12, 0, 0); //местное время в аэропорту
        this.delayNorm = 30*60*1000; //интервал в минутах; если контрольная точка сдвинулась меньше, чем эта величина, то это ещё не задержка

        this.airports = []; //массив названий аэропортов
        this.flyCompanies = [];//массив названий авиакомпаний
        this.flights = [];//массив объектов с параметрами рейсов
        /*
         Объект рейса имеет структуру:
         flightNum - номер рейса
         flyCompaniesId - номер авиакомпании в списке авиакомпаний
         depAirportId - номер аэропорта вылета в списке аэропортов
         arrAirportId - номер аэропорта прилета в списке аэропортов
         planDepTime - время ("чч:мм") вылета по расписанию
         flightTime - продолжительность полета ("чч:мм")
          */
        this.flightsOnGo = [];//массив объектов с параметрами рейсов, которые находятся "в работе"
        /*
         Объект рейса "в работе" имеет структуру:
         id - номер рейса  в списке рейсов
         data - плановая дата вылета рейса
         factCheck - фактическое/ожидаемое дата и время "контрольной точки" рейса: если это вылет - время вылета, если прилет - время прилета
          */
        this.setData = this.setData.bind(this);
        this.loadBase = this.loadBase.bind(this);
        this.getListToShow = this.getListToShow.bind(this);
        this.getAirportName = this.getAirportName.bind(this);
    }

    //функция в callback успешной загрузки данных с сервера - устанавливает загруженые данные в справочники
    setData (data) {
        this.airports = data.airports ? data.airports : []; //массив названий аэропортов
        this.flyCompanies = data.flyCompanies ? data.flyCompanies : [];//массив названий авиакомпаний
        this.flights = data.flights ? data.flights : [];//массив объектов с параметрами рейсов
        this.flightsOnGo = data.flightsOnGo ? data.flightsOnGo : [];//массив объектов с параметрами рейсов, которые находятся "в работе"
    }

    //загрузка данных с сервера
    loadBase (success, e) {
        var setData = this.setData;
        $.ajax ({
            url: "http://localhost:63342/aero-tt_backend/src/sky.php",
            type: "POST",
            data: ({}),
            dataType: "json",
            success: function (params){
                params = JSON.parse(params);
                setData(params);
                return success(e);
            }
        });
    }

// формирует таблицу рейсов для отображения по заданным параметрам фильтрации; если выводить нечего - массив пустой
    getListToShow (flowFlag, allFlag, flightFiltr, localAPrtId) {

//        flowFlag - флаг типа запрошенного потока: true = вылет, false = прилет
//        allFlag - флаг статуса запрошенного рейса: true = показывать все статусы, false = только задержанные
//        flightFiltr - маска фильтра по номеру рейса
//        localAPrtId - id местного аэропорта

        let flList = this.flightsOnGo;
        let maxNum = flList.length;
        let aPorts = this.airports;
        let aCmp = this.flyCompanies;
        let flights = this.flights;
        let res = [];

        for (let i=0; i<maxNum; i++) {

            let flightInform = flights[flList[i].id];

            //относится ли этот рейс к местному аэропорту
            if (!(localAPrtId===flightInform.depAirportId)&&!(localAPrtId===flightInform.arrAirportId)) continue;

            //соответствует ли направление запрошенному
            if (flowFlag !== (localAPrtId===flightInform.depAirportId)) continue;

            // расчет планового значения контрольной точки
            let depTime = flightInform.planDepTime.split(":",2);
            let depDate = flList[i].data.split("/",3);
            let planCheckDate = new Date(depDate[2],depDate[1]-1,depDate[0],depTime[0],depTime[1]);

            if (!flowFlag) {
                let flightTime = flightInform.flightTime.split(":",2);
                let arrFullDate = new Date();
                arrFullDate.setTime(planCheckDate.getTime() + flightTime[0]*60*60*1000 + flightTime[1]*60*1000);
                planCheckDate = arrFullDate;
            }

            //определение статуса рейса: true=задержан false=по расписанию
            let tmp = flList[i].factCheck.split(" ",2);
            let dateParts = tmp[0].split("/",3);
            let timeParts = tmp[1].split(":",2);
            let factCheckDate = new Date(dateParts[2],dateParts[1]-1,dateParts[0],timeParts[0],timeParts[1]);
            const isFactTimeInFuture = this.now.getTime() < factCheckDate.getTime(); //рейс ещё не завершился?
            let flightStatus = (factCheckDate.getTime() - planCheckDate.getTime() > this.delayNorm);

            //выводить ли незадержанные рейсы
            if (!allFlag && !flightStatus) continue;

            //запрошено отображение только номеров рейсов с заданной маской?
            if ((flightFiltr!=="")&& ((""+flightInform.flightNum).search(flightFiltr) === -1)) continue;

            //определение текста статуса рейса для отображения в таблице

            let statusText;
            if (isFactTimeInFuture) statusText = flightStatus ? "ожидается "+flList[i].factCheck : "по расписанию";
            else statusText = (flowFlag ? "вылетел " : "приземлился ")+flList[i].factCheck;

            res.push([
                aPorts[flowFlag ? flightInform.arrAirportId : flightInform.depAirportId],
                aCmp[flightInform.flyCompaniesId],
                flightInform.flightNum,
                planCheckDate.getDate()+"/"+(planCheckDate.getMonth()+1)+"/"+planCheckDate.getFullYear(),
                planCheckDate.getHours()+":"+(planCheckDate.getMinutes()<10?"0":"")+planCheckDate.getMinutes(),
                statusText,
                factCheckDate.toString(),
                flightStatus,
                planCheckDate
            ])
        }
        res.sort((a,b)=>{return a[8]-b[8]});
        return res;
    }

    getAirportName (airPortId) {
        let aPId = airPortId ? airPortId : 0;
        if (this.airports) return this.airports[Math.min(aPId,this.airports.length-1)];
        return "";
    }

    render () {
        return (
            <div className="App">
                <Control
                    loadData = {this.loadBase}
                    getTimeTable = {this.getListToShow}
                    getAirportName = {this.getAirportName}
                />
            </div>
        )

    }
}

export default SkyManager;
