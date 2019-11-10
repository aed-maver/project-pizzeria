import {select, templates} from '../settings.js';
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
    console.log(thisBooking.dom.wrapper);

    thisBooking.dom.wrapper.appendChild(generatedDOM);
    console.log(thisBooking.dom.wrapper);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

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

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

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

    //console.log(eventsCurrent);
    for(let value of eventsCurrent) {
      //console.log(value);
      //console.log(this.hrToNumeric(value.hour));
      thisBooking.makeBooked(value.date, value.hour, value.duration, value.table);
    }

    for(let value of eventsRepeat) {
      //console.log(value);
      thisBooking.makeBooked(value.date, value.hour, value.duration, value.table);
    }

    //console.log(eventsRepeat);
    console.log('Current and Repeated Events in this.booked');
    console.log(this.booked);
  }
  makeBooked(date, hour, duration, table){
    if(!this.booked[date]) {
      this.booked[date] = {};
    }
    for(let start = parseFloat(this.hrToNumeric(hour)); start <= parseFloat(this.hrToNumeric(hour, duration)); start += 0.5) {
      //console.log(start);
      if(!this.booked[date][`${start}`]) {
        this.booked[date][`${start}`] = [table];
      } else {
        this.booked[date][`${start}`].push(table);
      }
    }

    //console.log(this.booked);
    return this.booked;
  }
}
