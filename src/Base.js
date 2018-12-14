
class Base {
    constructor (params) {

        this.now = new Date(2018, 11, 12, 0, 0); //местное время в аэропорту
        this.delayNorm = 30*60*1000; //интервал в минутах; если контрольная точка сдвинулась меньше, чем эта величина, то это ещё не задержка
        this.airportId = typeof params.airportId === 'number' ? params.airportId : 0;

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

        this.loadBase();

    }

    //загрузка инофрмации о рейсах и необходимых справочников
    loadBase () {
        let params = require ('./db');
// !!!!здесь нужно поставить проверки на полноту и корректность данных; в противном случае исключать из списка "в работе"
        this.airports = params.airports ? params.airports : []; //массив названий аэропортов
        this.flyCompanies = params.flyCompanies ? params.flyCompanies : [];//массив названий авиакомпаний
        this.flights = params.flights ? params.flights : [];//массив объектов с параметрами рейсов
        this.flightsOnGo = params.flightsOnGo ? params.flightsOnGo : [];//массив объектов с параметрами рейсов, которые находятся "в работе"
    }

// формирует таблицу рейсов для отображения по заданным параметрам фильтрации; если выводить нечего - массив пустой
    getListToShow (flowFlag, allFlag, flightFiltr) {

//        flowFlag - флаг типа запрошенного потока: true = вылет, false = прилет
//        allFlag - флаг статуса запрошенного рейса: true = показывать все статусы, false = только задержанные
//        flightFiltr - маска фильтра по номеру рейса

        let flList = this.flightsOnGo;
        let maxNum = flList.length;
        let localAPrtId = this.airportId;
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

    // изменяет местное время в аэропорту на shift минут
    shiftAirportTime (shift) {
        let oldDate = this.now;
        this.now.setTime(oldDate.getTime() + shift*60*1000);
    }

    //выдает массив с датой в местном аэропорту и временем
    getLocalTime () {
        let d = this.now;
        let h = (d.getHours()<10?"0":"")+d.getHours();
        let m = (d.getMinutes()<10?"0":"")+d.getMinutes();
        let mn = (d.getMonth()+1<10?"0":"")+(d.getMonth()+1);
        return [
            d.getDate()+'/'+mn+'/'+d.getFullYear(),
            h+':'+m
        ]
    }

}

export default Base;