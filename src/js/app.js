import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';

const app = {

  initMenu: function(){
    const thisApp = this;
    console.log('thisApp', this);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    console.log(url);

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parseResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        console.log(`thisApp.data.products`, thisApp.data.products);

        /*  execute initMenu method */
        thisApp.initMenu();
        console.log('thisApp.data.products', thisApp.data.products);
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;
    thisApp.productList = document.querySelector(select.containerOf.menu);

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initPages: function(){
    const thisApp = this;
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    thisApp.activePage(thisApp.pages[0].id);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* TODO: get page id from href */
        let id = clickedElement.getAttribute('href').slice(1);
        //console.log(id.slice(1));
        thisApp.activePage(id);
        /* TODO: active page */

      });
    }
  },

  activePage: function(pageId){
    const thisApp = this;
    for(let link of thisApp.navLinks){
      link.classList.toggle = (classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  init: function(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initPages();
    thisApp.initCart();
  },
};

app.init();
