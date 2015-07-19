console.log('Loading function');

var aws = require('aws-sdk');
var cv = require('opencv');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    var params = {
        Bucket: bucket,
        Key: key
    };
    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object " + key + " from bucket " + bucket +
                ". Make sure they exist and your bucket is in the same region as this function.";
            console.log(message);
            context.fail(message);
        } else {
            console.log('File: ', key);
            console.log('CONTENT TYPE: ', data.ContentType);

            cv.readImage(new Buffer(data.Body, 'binary'), function(err, im) {
      				if (err) {
                console.log(err);
      					context.fail(err);
      				} else {
      					im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
                  if (err) {
                    console.log(err);
                    context.fail(err);
                  }
                  console.log(faces.length + ' Faces Detected');
      			    	context.succeed(faces.length + ' Faces Detected');
      	  			});
      				}
      			});
        }
    });
};
