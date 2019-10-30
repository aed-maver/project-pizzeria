import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;

    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHtml */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);

    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);

    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    //const productName = thisProduct.element.querySelector('h3.product__name');

    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(event){

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.add('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll(`article.active`);

      /*  START LOOP: for each active product */
      for (let activeProtuct of activeProducts) {

        /*    START: if the active product isn't the element of thisProduct */
        if(activeProtuct !== thisProduct.element) {

          /* remove class active for the active product */
          activeProtuct.classList.remove('active');

        /*    END: if the active product isn't the element of thisProduct */
        }

        /*  END LOOP: for each active product */
      }

      /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  processOrder(){

    const thisProduct = this;

    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);

    thisProduct.params = {};
    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;

    /* START LOOP: for each paramId in thisProduct.data.params */
    for(let paramId in thisProduct.data.params){

      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];

      /* START LOOP: for each optionId in param.options */
      for (let optionId in param.options) {

        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];

        /* START IF: if option is selected and option is not default */
        if(formData[paramId].indexOf(optionId) != -1 && option.default == undefined) {

          /* add price of option to variable price */
          price += option.price;

        /* END IF: if option is selected and option is not default */
        }

        /* START ELSE IF: if option is not selected and option is default */
        if(formData[paramId].indexOf(optionId) == -1 && option.default == true) {

          /* deduct price of option from price */
          price -= option.price;

        /* END ELSE IF: if option is not selected and option is default */
        }

        // Images interaction
        if(formData[paramId].indexOf(optionId) != -1) {
          const image = this.element.querySelector(`img[class*="${optionId}"]`);
          if (image != null) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          const image = this.element.querySelector(`img[class*="${optionId}"]`);
          if (image != null) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

        if(!thisProduct.params[paramId]){
          thisProduct.params[paramId] = {
            label: param.label,
            options: {},
          };
        }
        thisProduct.params[paramId].options[optionId] = option.label;

      /* END LOOP: for each optionId in param.options */
      }

      /* END LOOP: for each paramId in thisProduct.data.params */
    }

    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}
