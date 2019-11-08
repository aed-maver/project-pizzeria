import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';
import {Booking} from './components/Booking.js';

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

    //thisApp.activePage(thisApp.pages[0].id);
    let pagesMatchingHash = [];

    if(window.location.hash.length > 2){
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }

    thisApp.activePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* TODO: get page id from href */
        let id = clickedElement.getAttribute('href').replace('#', '');
        //console.log(id.slice(1));
        thisApp.activePage(id);
        /* TODO: active page */

      });
    }
  },

  activePage: function(pageId){
    const thisApp = this;
    window.location.hash = '#/' + pageId;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }
  },

  initBooking: function(){
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    return new Booking(bookingWrapper);
  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
