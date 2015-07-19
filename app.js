// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var cv = require('opencv');

// get reference to S3 client
var s3 = new AWS.S3();

exports.handler = function(event, context) {

	// Read options from the event.
	console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
	var srcBucket = event.Records[0].s3.bucket.name;

	// Object key may have spaces or unicode non-ASCII characters.
  var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
	var dstBucket = srcBucket + "resized";
	var dstKey    = "resized-" + srcKey;

	// Sanity check: validate that source and destination are different buckets.
	if (srcBucket == dstBucket) {
		console.error("Destination bucket must not match source bucket.");
		return;
	}

	// Infer the image type.
	var typeMatch = srcKey.match(/\.([^.]*)$/);
	if (!typeMatch) {
		console.error('unable to infer image type for key ' + srcKey);
		return;
	}

	var imageType = typeMatch[1];
	if (imageType != "jpg" && imageType != "png") {
		console.log('skipping non-image ' + srcKey);
		return;
	}

	// Download the image from S3, transform, and upload to a different S3 bucket.
	async.waterfall([
		function download(next) {
			// Download the image from S3 into a buffer.
			s3.getObject({
					Bucket: srcBucket,
					Key: srcKey
				},
				next);
			},
		function transform(response, next) {
			cv.readImage(new Buffer(response.Body, 'binary'), function(err, im) {
				if (err) {
					return next(err);
				} else {
					im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
			    	for (var i=0;i<faces.length; i++){
			      	var x = faces[i];
			      	im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
			    	}
		    		next(null, response.ContentType, im);
	  			});
				}
			});
		},
		function upload(contentType, data, next) {
			// Stream the transformed image to a different S3 bucket.
			s3.putObject({
					Bucket: dstBucket,
					Key: dstKey,
					Body: data,
					ContentType: contentType
				},
				next);
			}
		], function (err) {
			if (err) {
				console.error(
					'Unable to resize ' + srcBucket + '/' + srcKey +
					' and upload to ' + dstBucket + '/' + dstKey +
					' due to an error: ' + err
				);
			} else {
				console.log(
					'Successfully resized ' + srcBucket + '/' + srcKey +
					' and uploaded to ' + dstBucket + '/' + dstKey
				);
			}
			context.done();
		}
	);
};
