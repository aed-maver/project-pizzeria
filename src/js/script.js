/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  // SELECTED ELEMENT SETTINGS LIST ID'S, CLASSES, ELEMENTS
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',

    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  // ELEMENT CLASS NAMES - MOSTLY ACTIVE
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  // OTHER SETTINGS LIKE AMOUNTS VALUES FOR PRODUCT INGRIDIENTS
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  // COMPILATION OF HANDLEBAR TEMPLATE
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
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
      console.log(`\n \t renderInMenu Works`);

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
      console.log(`\n \t getElements Works`);

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
      console.log(`\n \t initAccordion Works`);

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
      console.log(`\n \t initOrderForm works`);

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
      });

    }

    initAmountWidget(){
      const thisProduct = this;
      console.log(`\n \t initAmountWidget works -> runs process Order on UPDATED event`);

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    processOrder(){
      console.log('\n \t processOrder runs');
      const thisProduct = this;
      console.log(thisProduct);

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.dir(`formData is`);
      console.dir(formData);

      /* set variable price to equal thisProduct.data.price */
      console.log(`thisProduct.data.price is`, thisProduct.data.price);
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
            //const allImages = this.element.querySelector(select.menuProduct.imageWrapper);
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

        /* END LOOP: for each optionId in param.options */
        }

        /* END LOOP: for each paramId in thisProduct.data.params */
      }

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      /* thisProduct.amountWidget.value = 2; ==> THIS WORKS, value from widget
      do not reach this place */
      price *= thisProduct.amountWidget.value;
      this.priceElem.innerHTML = price;
    }
  }

  // OBJECT THAT GONNA CHANGE AMOUNTS
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      console.log(`new AmountWidget was crated -> triggers UPDATED Announce`);

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      thisWidget.announce();

    }

    getElements(element){
      const thisWidget = this;
      console.log(`Widget - getElements works`);

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      console.log(`current value is: ${thisWidget.value}`);
      console.log(`Widget - setValue works and gets: ${value} -> triggers UPDATED Announce`);

      const newValue = parseInt(value);

      /* TODO: Add validation */
      if(thisWidget.value != value && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
      //thisWidget.input.value = 5; //<=== works
    }

    initActions(){
      const thisWidget = this;
      console.log(`\n \t Widget - initActions works`);

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        console.log(`CLICK WAS DONE`);
        console.log(`thisWidget.value is ${thisWidget.value}`);
        thisWidget.setValue(thisWidget.value + 1);
        console.log(`thisWidget.value after click is ${thisWidget.value}`);
      });
    }

    announce(){
      const thisWidget = this;
      const event = new Event('updated');

      console.log(`Widget - event UPDATED was Announced`);
      console.log(event);
      thisWidget.element.dispatchEvent(event);
    }
  }

  // OBJECT THAT RUN'S ALL PARTS OF APP
  const app = {
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
