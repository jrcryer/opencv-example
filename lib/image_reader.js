
module.exports = function(opencv) {

  var Promise = require('promise');

  var readImage = function(data) {
    return new Promise(function(resolve, reject) {
      console.log('Reading image...');
      
      opencv.readImage(new Buffer(data.Body, 'binary'), function(err, image) {
        if (err) {
          return reject(err);
        }
        return resolve(image);
      });
    });
  };

  return {
    read: readImage
  };
};
