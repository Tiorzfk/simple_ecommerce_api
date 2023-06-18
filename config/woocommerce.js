var WooCommerce = require('woocommerce');
const env = require('./env')

var wooCommerce = new WooCommerce({
  url: env.WC.STORE_URL,
  ssl: true,
  consumerKey: env.WC.CONSUMER_KEY,
  secret: env.WC.CONSUMER_SECRET,
  apiPath: '/wp-json/wc/v3/',
  logLevel: 1
});

module.exports = wooCommerce