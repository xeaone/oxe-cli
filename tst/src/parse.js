const Fs = require('fs');
const Util = require('util');
const Parser = require('../ideas/parser.js');

const ReadFile = Util.promisify(Fs.readFile);

(async function() {

	const data = await ReadFile('./index.html', 'utf8');

	const result = Parser.parse({
		html: data,
    	start: function (tag, attributes, unary) {
			console.log(tag);
		},
    	end: function (tag) {
			console.log(tag);
		},
    	chars: function (text) {},
    	comment: function (text) {}
	});

}()).catch(console.error);
