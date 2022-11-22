var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ImageSchema  = new Schema(
	{ 
	  name: String,
	  desc: String,
	  img: 
		{ data: Buffer, contentType: String } // data: Buffer - Allows us to store our image as data in the form of arrays.
	}
  );
Image = mongoose.model('Image', ImageSchema);

module.exports = Image;