// Generated by CoffeeScript 1.7.1
var City, addCityKeys, americano, async, http, httpGet;

http = require("http");

async = require("async");

americano = require("americano-cozy");

module.exports = City = americano.getModel("City", {
  "name": {
    "type": String
  },
  "created": {
    "type": Date,
    "default": Date
  }
});

httpGet = function(url, deflt, callback) {
  var req, result;
  result = deflt;
  req = http.get(url, function(res) {
    var chunks, data, length;
    data = "";
    chunks = [];
    length = 0;
    res.on("data", function(chunk) {
      chunks.push(chunk);
      return length += chunk.length;
    });
    return res.on("end", function() {
      data = Buffer.concat(chunks, length);
      result = "";
      if (data.length) {
        result = JSON.parse(data.toString("UTF-8"));
      }
      return callback(result);
    });
  });
  return req.on("error", function() {
    return callback(deflt, "error");
  });
};

addCityKeys = function(mainKey, values, city) {
  var key, value;
  for (key in values) {
    value = values[key];
    city[mainKey][key] = value;
  }
  return city;
};

City.baseUrl = "http://api.openweathermap.org/data/2.5/";

City.weatherUrl = City.baseUrl + "weather?q=";

City.forecastUrl = City.baseUrl + "forecast/?q=";

City.dayForecastUrl = City.baseUrl + "forecast/daily?cnt=5&q=";

City.fullCity = function(city, mainCallback) {
  var dayForecastUrl, forecastUrl, fullCity, weatherUrl;
  weatherUrl = City.weatherUrl + city.name;
  forecastUrl = City.forecastUrl + city.name;
  dayForecastUrl = City.dayForecastUrl + city.name;
  fullCity = {
    "id": city.id,
    "name": city.name,
    "weather": {},
    "hours": {},
    "days": {}
  };
  return async.series([
    (function(callback) {
      return httpGet(weatherUrl, null, (function(_this) {
        return function(weather, err) {
          if (!err) {
            fullCity = addCityKeys("weather", weather, fullCity);
          }
          return callback();
        };
      })(this));
    }), (function(callback) {
      return httpGet(forecastUrl, null, (function(_this) {
        return function(forecast, err) {
          if (!err) {
            fullCity = addCityKeys("hours", forecast, fullCity);
          }
          return callback();
        };
      })(this));
    }), (function(callback) {
      return httpGet(dayForecastUrl, null, (function(_this) {
        return function(forecast, err) {
          if (!err) {
            fullCity = addCityKeys("days", forecast, fullCity);
          }
          return callback(null, fullCity);
        };
      })(this));
    })
  ], function(err, results) {
    return mainCallback(null, fullCity);
  });
};

City.fullCities = function(cities, callback) {
  return async.map(cities, this.fullCity, function(err, results) {
    return callback(err, results);
  });
};

City.all = function(callback) {
  return this.request("all", (function(_this) {
    return function(err, cities) {
      if (err) {
        return callback.call(_this, err, []);
      } else {
        return _this.fullCities(cities, callback);
      }
    };
  })(this));
};
