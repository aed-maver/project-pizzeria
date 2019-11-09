import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions();

  }

  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);

    thisWidget.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value--;
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value++;
    });
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
}
