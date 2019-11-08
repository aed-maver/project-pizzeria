//import {utils} from '../utils.js';
import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking {
  constructor(arg) {
    const thisApp = this;
    thisApp.render(arg);
    thisApp.initWidgets();
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

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}
