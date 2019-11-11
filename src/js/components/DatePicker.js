import { BaseWidget } from './BaseWidget.js';
import { utils } from '../utils.js';
import { select, settings } from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      dateFormat: 'Y-m-d',
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1 || date.getDay() === 0);
        }
      ],
      onChange: function(selectedDate, dateStr) {
        thisWidget.value = dateStr;
      },
    });
  }

  parseValue(arg){
    return arg;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}
