import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';
import { settings } from '../settings.js';

export class Booking {
  constructor(arg) {
    const thisApp = this;
    thisApp.render(arg);
    thisApp.initWidgets();
    thisApp.getData();
  }

  render(arg) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = arg;


    thisBooking.dom.wrapper.appendChild(generatedDOM);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', () => {
      thisBooking.updateDOM();
    });

  }
  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  hrToNumeric(arg, argDuration) {
    let hrNumeric = arg.split(':');
    let duration = argDuration || 0;
    let hrNumber = parseInt(hrNumeric[0]);
    let minNumber = parseFloat(hrNumeric[1] === '30' ? 0.5 : 0);
    return `${hrNumber + minNumber + duration}`;
  }

  // eslint-disable-next-line no-unused-vars
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for(let value of eventsCurrent) {
      thisBooking.makeBooked(value.date, value.hour, value.duration, value.table);
    }

    for(let value of eventsRepeat) {
      thisBooking.makeBooked(value.date, value.hour, value.duration, value.table);
    }

    this.updateDOM();
  }
  makeBooked(date, hour, duration, table){ // here some error
    if(!this.booked[date]) {
      this.booked[date] = {};
    }
    for(let start = parseFloat(this.hrToNumeric(hour)); start <= parseFloat(this.hrToNumeric(hour, duration)); start += 0.5) {
      if(!this.booked[date][`${start}`]) {
        this.booked[date][`${start}`] = [table];
      } else {
        this.booked[date][`${start}`].push(table);
      }
    }
    return this.booked;
  }

  updateDOM(){
    const thisBooking = this;
    console.log(this.booked);

    thisBooking.date = thisBooking.datePicker.value;
    console.log(this.date);
    thisBooking.hour = this.hrToNumeric(`${thisBooking.hourPicker.value}`);
    console.log(this.hour);

    for(let table of this.dom.tables){

      // TESTING CONDITIONS SECTION
      console.log(thisBooking.booked[thisBooking.date]);
      if(thisBooking.booked[thisBooking.date]){
        console.log(thisBooking.booked[thisBooking.date].hasOwnProperty(this.hour));
        if(thisBooking.booked[thisBooking.date].hasOwnProperty(this.hour) === true){
          console.log(thisBooking.booked[thisBooking.date][thisBooking.hour]);
          console.log(thisBooking.booked[thisBooking.date][thisBooking.hour]
            .indexOf(settings.booking.tableIdAttribute) === -1);
        }
      }
      // END OF THESTING CONDITIONS

      if(thisBooking.booked[thisBooking.date] &&
        thisBooking.booked[thisBooking.date].hasOwnProperty(this.hour) &&
        thisBooking.booked[thisBooking.date][thisBooking.hour]
          .indexOf(settings.booking.tableIdAttribute) === -1){

        console.log('class booked add');
        table.classList.add(classNames.booking.tableBooked);
      } else {
        console.log('class booked remove');
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
}
