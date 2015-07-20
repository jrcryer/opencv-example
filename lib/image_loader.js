
module.exports = function(datastore) {

  var Promise = require('promise');

  var loadImage = function(query) {
    return new Promise(function(resolve, reject) {
      console.log('Loading image...');
      
      datastore.getObject(query, function(err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  return {
    load: loadImage
  };
};
