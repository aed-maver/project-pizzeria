import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart {
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    console.log('thisCart.products', thisCart.products);

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();

  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = document.querySelector(select.cart.productList);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);

    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();

      if(thisCart.dom.wrapper.className.indexOf(classNames.cart.wrapperActive) != -1 ) {
        thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);
      } else {
        thisCart.dom.wrapper.classList.add(classNames.cart.wrapperActive);
      }
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHtml */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to DOM */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();

  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    for(const element of thisCart.products) {
      thisCart.subtotalPrice += element.price;
      thisCart.totalNumber += element.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
    thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    for(let key in thisCart.renderTotalsKeys){
      for(let elem in thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct) {
    const thisCart = this;

    //console.log('cartProduct', cartProduct);

    const index = thisCart.products.indexOf(cartProduct);
    //console.log('index', index);

    thisCart.products.splice(index, 1);
    //console.log('thisCart.products after splice', thisCart.products);

    console.log(`cartProduct.dom.wrapper of`, cartProduct.dom.wrapper);
    console.log(`thisCart.dom.productList`, thisCart.dom.productList);
    thisCart.dom.productList.removeChild(cartProduct.dom.wrapper);
    thisCart.update();

    console.log(`thisCart.products`, thisCart.products);
    console.log(`thisCart.products === 0 is `, thisCart.products.length === 0);
    if (thisCart.products.length === 0) {
      thisCart.deliveryFee = 0;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.totalPrice = 0;
      thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
      console.log(`thisCart`, thisCart);
    }
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.address,
      phone: thisCart.phone,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let product of thisCart.products) {
      payload.products.push(product.getData);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}
