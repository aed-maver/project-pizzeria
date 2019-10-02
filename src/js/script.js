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
  /* const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  }; */

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

      //console.log('new Product:', thisProduct);
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
      //console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }
    initAccordion(){
      const thisProduct = this;
      //console.log(this);

      /* find the clickable trigger (the element that should react to clicking) */
      //const productName = thisProduct.element.querySelector('h3.product__name');
      //console.log(productName);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        //console.log('Product-Name Header was clicked!');

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.add('active');

        /* find all active products */
        const activeProducts = document.querySelectorAll(`article.active`);
        //console.log(activeProducts);

        /*  START LOOP: for each active product */
        for (let activeProtuct of activeProducts) {
          //console.log('activeProduct is', activeProtuct);
          //console.log('activeProtuct !== thisProduct.element', activeProtuct !== thisProduct.element);

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
      //console.log(thisProduct);

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

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      console.log('this.amountWidetElem is:', this.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
    }
    processOrder(){
      const thisProduct = this;
      console.log(thisProduct);

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      //console.log(this.data);

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      //console.log(price);

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){
        //console.log(paramId);
        ////console.log('this.data.params:', thisProduct.data.params);
        ////console.log(thisProduct.data.params[paramId]);

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        //console.log('param is:',param);

        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          //console.log('optionId is:', optionId);
          ////console.log('option is:', option);

          //console.log(formData[paramId].indexOf(optionId));
          //console.log(option.default);

          /* START IF: if option is selected and option is not default */
          if(formData[paramId].indexOf(optionId) != -1 && option.default == undefined) {
            //console.log('Selected and not Default', formData[paramId].indexOf(optionId));

            /* add price of option to variable price */
            price += option.price;
            //console.log(price);

          /* END IF: if option is selected and option is not default */
          }

          /* START ELSE IF: if option is not selected and option is default */
          if(formData[paramId].indexOf(optionId) == -1 && option.default == true) {
            //console.log('Not selected and Default');

            /* deduct price of option from price */
            price -= option.price;
            //console.log(price);

          /* END ELSE IF: if option is not selected and option is default */
          }

          // Images interaction
          if(formData[paramId].indexOf(optionId) != -1) {
            //const allImages = this.element.querySelector(select.menuProduct.imageWrapper);
            const image = this.element.querySelector(`img[class*="${optionId}"]`);
            //console.log(allImages);
            //console.log(image);
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
      price *= thisProduct.amountWidget.value;
      this.priceElem.innerHTML = price;

    }
  }

  // OBJECT THAT GONNA CHANGE AMOUNTS
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      thisWidget.announce();
      console.log('Amount Widget:', thisWidget);
      console.log('constructor arguments:', element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      thisWidget.value = newValue;
      this.announce();
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this;
      console.log(`initAction works`);
      console.log('this.element', this.element);
      console.log('setValue is',this.setValue());
      this.input.addEventListener('change', thisWidget.setValue(thisWidget.input.value));
      this.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        console.log(this.value);
      });
      this.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        console.log('this.value is:', thisWidget.value);
      });
    }
    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  // OBJECT THAT RUN'S ALL PARTS OF APP
  const app = {
    initMenu: function(){
      const thisApp = this;

      //console.log('thisApp.data:', thisApp.data);

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
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
