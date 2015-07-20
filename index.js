
console.log('Loading function...');

var aws     = require('aws-sdk');
var opencv  = require('opencv');
var Promise = require('promise');
var s3      = new aws.S3({ apiVersion: '2006-03-01' });
var get     = require('./lib/image_loader')(s3).load;
var read    = require('./lib/image_reader')(opencv).read;
var detect  = require('./lib/face_detector')(opencv).detect;

exports.handler = function(event, context) {

  var onComplete = function(numOfFaces) {
    console.log(numOfFaces + ' Face(s) Detected');
    context.succeed(numOfFaces + ' Face(s) Detected');
  };

  var onFailure = function(err) {
    console.log(err);
    context.fail(err);
  };

  var resource = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key
  };

  get(resource).then(read, onFailure)
               .then(detect, onFailure)
               .done(onComplete, onFailure);
};
