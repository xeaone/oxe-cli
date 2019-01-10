const Vm = require('vm');
const Fs = require('fs');
const Util = require('util');
const Path = require('path');
const Jsdom = require('jsdom');

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

(async function () {

	const input = process.argv[2];

	if (!input) throw new Error('oxe - requires argument input');

	const indexHtmlPath = Path.resolve(Path.join(input, 'index.html'));
	const indexHtmlData = await ReadFile(indexHtmlPath, 'utf8');

	const { window } = new Jsdom.JSDOM(indexHtmlData, {
		resources: 'usable',
		runScripts: 'dangerously',
		url: `file://${Path.resolve(input)}`
	});

	const mutationObserverJsPath = Path.join(__dirname, 'mutation-observer.js');
	const mutationObserverJsData = await ReadFile(mutationObserverJsPath, 'utf8');
	window.eval(mutationObserverJsData);

	const polyJsPath = Path.join(__dirname, '../node_modules/oxe/dst', 'poly.min.js');
	const polyJsData = await ReadFile(polyJsPath, 'utf8');
	window.eval(polyJsData);

	const oxeJsPath = Path.join(__dirname, '../node_modules/oxe/dst', 'oxe.js');
	const oxeJsData = await ReadFile(oxeJsPath, 'utf8');
	window.eval(oxeJsData);

	window.scroll = function () {};
	window.Oxe.loader.type.js = 'es';

	const indexJsPath = Path.resolve(Path.join(input, 'index.js'));
	const indexJsData = await ReadFile(indexJsPath, 'utf8');
	window.eval(indexJsData);

	console.log(window.Oxe.router.data);

}()).catch(console.error);
