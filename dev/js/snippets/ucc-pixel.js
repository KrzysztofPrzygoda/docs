"use strict";

/* https://github.com/js-cookie/js-cookie */
/*! js-cookie v2.2.1 | MIT */
!function(a){var b;if("function"==typeof define&&define.amd&&(define(a),b=!0),"object"==typeof exports&&(module.exports=a(),b=!0),!b){var c=window.Cookies,d=window.Cookies=a();d.noConflict=function(){return window.Cookies=c,d}}}(function(){function a(){for(var a=0,b={};a<arguments.length;a++){var c=arguments[a];for(var d in c)b[d]=c[d]}return b}function b(a){return a.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}function c(d){function e(){}function f(b,c,f){if("undefined"!=typeof document){f=a({path:"/"},e.defaults,f),"number"==typeof f.expires&&(f.expires=new Date(1*new Date+864e5*f.expires)),f.expires=f.expires?f.expires.toUTCString():"";try{var g=JSON.stringify(c);/^[\{\[]/.test(g)&&(c=g)}catch(j){}c=d.write?d.write(c,b):encodeURIComponent(c+"").replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),b=encodeURIComponent(b+"").replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var h="";for(var i in f)f[i]&&(h+="; "+i,!0!==f[i]&&(h+="="+f[i].split(";")[0]));return document.cookie=b+"="+c+h}}function g(a,c){if("undefined"!=typeof document){for(var e={},f=document.cookie?document.cookie.split("; "):[],g=0;g<f.length;g++){var h=f[g].split("="),i=h.slice(1).join("=");c||'"'!==i.charAt(0)||(i=i.slice(1,-1));try{var j=b(h[0]);if(i=(d.read||d)(i,j)||b(i),c)try{i=JSON.parse(i)}catch(k){}if(e[j]=i,a===j)break}catch(k){}}return a?e[a]:e}}return e.set=f,e.get=function(a){return g(a,!1)},e.getJSON=function(a){return g(a,!0)},e.remove=function(b,c){f(b,"",a(c,{expires:-1}))},e.defaults={},e.withConverter=c,e}return c(function(){})});
const _ucc_cookies = Cookies.noConflict();

/**
 Simple UCC event notification API.

 It exposes one optional shop url setup method, three methods for notifying UCC about conversion events
 and one accessory method for specifying products related to the event.

 _ucc.overrideShopUrl(baseShopUrl) -> for shops with base urls ending with a path/subdirectory, e.g. example.com/shop
 Calling this method is not required for shops with regular base urls, like example.com or *.example.com

 _ucc.addProductToNotification(gtin, count, price) -> for adding products related to the upcoming notification.
 Explained in more detail in example calls below.

 _ucc.notifyProductView() -> notifies UCC that a product page was visited.
 Should be preceded with a call to _ucc.addProductToNotification(gtin, count, price)
 EXAMPLE:
 _ucc.addProductToNotification('5300123410942', 1, 599.99); // count is actually ignored for this notification
 _ucc.notifyProductView();

 _ucc.notifyAddToCart() -> notifies UCC that a product (or multiple different products) was added to the cart.
 Should be preceded with one or more calls to _ucc.addProductToNotification(gtin, count, price).
 EXAMPLE (for two different products being added to cart at once):
 _ucc.addProductToNotification('5300123410942', 2, 599.99); // 2 pieces of product with GTIN '5300123410942'
 _ucc.addProductToNotification('4083718569133', 1, 99.99); // 1 piece of product with GTIN '4083718569133'
 _ucc.notifyAddToCart();

 _ucc.notifyPurchase() -> notifies UCC that a product (or multiple different products) were purchased.
 EXAMPLE (for two different products being purchased):
 _ucc.addProductToNotification('5300123410942', 2, 549.99); // 2 pieces of product with GTIN '5300123410942'
 _ucc.addProductToNotification('4083718569133', 1, 89.99); // 1 piece of product with GTIN '4083718569133'
 _ucc.notifyPurchase();

 Sending a notification will clear the internal array of related products, which means that
 _ucc.addProductToNotification(gtin, count) must be called again after each notification is sent.
 */
window._ucc = function () {

  const utmSourceParam = "utm_source";
  const utmMediumParam = "utm_medium";
  const utmCampaignParam = "utm_campaign";
  const utmTermParam = "utm_term";
  const utmContentParam = "utm_content";
  const utmSourceCookieName = "_ucc_utm_source";
  const utmMediumCookieName = "_ucc_utm_medium";
  const utmCampaignCookieName = "_ucc_utm_campaign";
  const utmTermCookieName = "_ucc_utm_term";
  const utmContentCookieName = "_ucc_utm_content";

  let products = [];
  let shopUrl;

  storeUtmInCookiesIfExistsInUrl();

  function storeUtmInCookiesIfExistsInUrl() {
    const searchParams = new URLSearchParams(location.search);
    const utmSource = searchParams.get(utmSourceParam);
    if ("ucc" === utmSource) {
      _ucc_cookies.set(utmSourceCookieName, utmSource, { expires: 30 });
      if (searchParams.has(utmMediumParam)) {
        _ucc_cookies.set(utmMediumCookieName, searchParams.get(utmMediumParam), { expires: 30 });
      }
      if (searchParams.has(utmCampaignParam)) {
        _ucc_cookies.set(utmCampaignCookieName, searchParams.get(utmCampaignParam), { expires: 30 });
      }
      if (searchParams.has(utmTermParam)) {
        _ucc_cookies.set(utmTermCookieName, searchParams.get(utmTermParam), { expires: 30 });
      }
      if (searchParams.has(utmContentParam)) {
        _ucc_cookies.set(utmContentCookieName, searchParams.get(utmContentParam), { expires: 30 });
      }
    }
  }

  function retrieveUtmFromCookies() {
    return {
      utmSource: _ucc_cookies.get(utmSourceCookieName) ? decodeURIComponent(_ucc_cookies.get(utmSourceCookieName)) : null,
      utmMedium: _ucc_cookies.get(utmMediumCookieName) ? decodeURIComponent(_ucc_cookies.get(utmMediumCookieName)) : null,
      utmCampaign: _ucc_cookies.get(utmCampaignCookieName) ? decodeURIComponent(_ucc_cookies.get(utmCampaignCookieName)) : null,
      utmTerm: _ucc_cookies.get(utmTermCookieName) ? decodeURIComponent(_ucc_cookies.get(utmTermCookieName)) : null,
      utmContent: _ucc_cookies.get(utmContentCookieName) ? decodeURIComponent(_ucc_cookies.get(utmContentCookieName)) : null,
    }
  }

  function sendToApiAndClearProducts(event) {
    const request = new XMLHttpRequest();
    request.open('POST', 'https://api.ucancommerce.com/api/v1/pixel/event', true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    let body = {event, userAgent: navigator.userAgent, products, shopUrl, ...retrieveUtmFromCookies()};
    request.send(JSON.stringify(body));
    products = [];
  }

  return {
    overrideShopUrl: (baseShopUrl) => shopUrl = baseShopUrl,
    addProductToNotification: (gtin, count, price, internalId = false) => products.push({gtin, count, price, internalId}),
    notifyProductView: () => sendToApiAndClearProducts('PRODUCT_VIEW'),
    notifyAddToCart: () => sendToApiAndClearProducts('ADD_TO_CART'),
    notifyPurchase: () => sendToApiAndClearProducts('PURCHASE')
  };
}();
