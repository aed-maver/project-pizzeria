import { BaseWidget } from './BaseWidget.js';
import { utils } from '../utils.js';
import { settings, select } from '../settings.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.renderValue(settings.hours.open);

  }

  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', () => {
      this.value = thisWidget.dom.input.value;
    });
  }

  parseValue(arg){
    return utils.numberToHour(arg);
  }

  isValid(){
    return true;
  }

  renderValue(arg){
    const thisWidget = this;
    console.log(this.dom.output);
    thisWidget.dom.output.innerHTML = thisWidget.parseValue(arg);
  }
}
