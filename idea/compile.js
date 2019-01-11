const Vm = require('vm');
const Fs = require('fs');
const Util = require('util');
const Path = require('path');
const Jsdom = require('jsdom');

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

(async function () {

	if (!process.argv[2]) throw new Error('oxe - requires argument input');

	const input = Path.resolve(process.argv[2]);

	const indexHtmlPath = Path.join(input, 'index.html');
	const indexHtmlData = await ReadFile(indexHtmlPath, 'utf8');

	const { window } = new Jsdom.JSDOM(indexHtmlData, {
		resources: 'usable',
		runScripts: 'dangerously',
		url: `file://${input}/`
	});

	// const mutationObserverJsPath = Path.join(__dirname, 'mutation-observer.js');
	// const mutationObserverJsData = await ReadFile(mutationObserverJsPath, 'utf8');
	// window.eval(mutationObserverJsData);
	//
	// const polyJsPath = Path.join(__dirname, '../node_modules/oxe/dst', 'poly.min.js');
	// const polyJsData = await ReadFile(polyJsPath, 'utf8');
	// window.eval(polyJsData);
	//
	// const oxeJsPath = Path.join(__dirname, '../node_modules/oxe/dst', 'oxe.js');
	// const oxeJsData = await ReadFile(oxeJsPath, 'utf8');
	// window.eval(oxeJsData);
	//
	// window.scroll = function () {};
	// window.Oxe.loader.type.js = 'es';
	//
	// const indexJsPath = Path.join(input, 'index.js');
	// const indexJsData = await ReadFile(indexJsPath, 'utf8');
	// window.eval(indexJsData);


	// poly: start

	window.requestAnimationFrame = function (callback) {
		console.log('tick');
		if (typeof callback === 'function') {
			callback();
		}
	};

	// window.fetch = function () {};
	window.scroll = function () {};
	window.customElements = { define: function () {} };
	window.HTMLUnknownElement = Object.create(window.Element.prototype, {});
	// poly: end

	const scripts = Array.from(window.document.querySelectorAll('script'));

	const oxeScript = scripts.find(function (script) {
		return script.src.includes('oxe.js');
	});

	const routeAfter = function () {
		const component = window.Oxe.location.route.component;

		if (!('element' in component)) {
			component.element = window.document.querySelector(component.name);
		}

		const scope = component.name + '-' + component.count++;

		component.element.scope = scope;

		window.Oxe.component.render(component.element, component);
		window.Oxe.binder.bind(component.element, component.element, component.element.scope);

		setTimeout(function () {
			console.log(component);
			console.log(window.Oxe.binder.data);
			console.log(window.document.body.parentElement.outerHTML);
		}, 6000);
		
	};

	oxeScript.addEventListener('load', function () {
		window.Oxe.loader.type.js = 'es';
		window.Oxe.router.on('route:after', routeAfter);
	});

}()).catch(console.error);
