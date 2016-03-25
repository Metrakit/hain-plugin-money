/*jshint esversion: 6 */
/*jshint globalstrict: true */
'use strict';

const _       = require('lodash');
const request = require('request');

var query_url = "http://free.currencyconverterapi.com/api/v3/convert?q=";

module.exports = (pluginContext) => {
    const shell = pluginContext.shell;

    var currencies = ['EUR', 'USD', 'PHP'];

    const logger = pluginContext.logger;

    function buildUrl(target)
    {
      var url = query_url;
      var curs = _.reject(currencies, (x) => x === target);
      _.forEach(curs, (value) => {
        url = url + target + '_' + value + ',';
      });
      return url.slice(0, -1);
    }

    function search(query, res) {

        const queries = query.split(" ");

        if (queries.length >= 2) {
          if (typeof parseInt(queries[1]) !== 'number') {
            return res.add({
              id: 'error',
              payload: 'open',
              title: 'The parameter should be an integer !',
              desc: 'Example : /money 1 EUR or /money 10 USD'
            });
          }
        }

        if (queries.length == 3) {
          var url = buildUrl(queries[2]);
          request({
              url: url,
              json: true
          }, function (error, response, body) {

            if (!error && response.statusCode === 200 && body.results) {
                var results = body.results;
                _.forEach(results, (value) => {
                  value.cash = queries[1];
                  res.add({
                    id: value,
                    payload: 'open',
                    title: queries[1] + ' ' + value.fr + ' = ' + (queries[1] * value.val) + ' ' + value.to
                  });
                });
            }

            if (queries.length > 3) {
              return res.add({
                id: 'error',
                payload: 'open',
                title: 'Too many arguments !',
                desc: 'Example : /money 1 EUR or /money 10 USD'
              });
            }
          });
        }
    }

    function execute(obj, payload) {
        if (payload !== 'open') {
            return;
        }
        if (obj !== "error") {
          var fr = obj.fr;
          var to = obj.to;
          var cash = obj.cash;
          shell.openExternal(`https://www.google.com/finance/converter?a=${cash}&from=${fr}&to=${to}`);
        }
    }

    return {search, execute};
};