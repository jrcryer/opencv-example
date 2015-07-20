
module.exports = function(opencv) {

  'use strict';

  var Promise = require('promise');

  var detectFaces = function(image) {
    return new Promise(function(resolve, reject) {
      console.log('Detecting faces...');
      
      image.detectObject(opencv.FACE_CASCADE, {}, function(err, faces) {
        if (err) {
          return reject(err);
        }
        return resolve(faces.length);
      });
    });
  };

  return {
    detect: detectFaces
  };
};
