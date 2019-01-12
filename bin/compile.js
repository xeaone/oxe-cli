const Vm = require('vm');
const Fs = require('fs');
const Util = require('util');
const Path = require('path');
const Jsdom = require('jsdom');

const Stat = Util.promisify(Fs.stat);
const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

module.exports = async function (data) {

	if (!data.input) throw new Error('oxe - requires input argument');

	const input = Path.resolve(data.input);
	const stat = await Stat(input);

	const folder = stat.isDirectory() ? input : Path.dirname(input);
	const file = stat.isFile() ? input : Path.join(input, 'index.html');

	const beforeParse = function (window) {

		const polyPath = Path.join(__dirname, 'poly.js');
		const polyData = Fs.readFileSync(polyPath, 'utf8');
		window.eval(polyData);

		window.scroll = function () {};
		window.customElements = { define: function () {} };
		window.HTMLUnknownElement = Object.create(window.Element.prototype, {});
	};

	class ResourceLoader extends Jsdom.ResourceLoader {

		fetch(url, options) {
			url = url.slice(7);
			url = url.replace(folder, '');
			url = Path.join(folder, url);
			// console.log(url);
			return super.fetch('file://' + url, options);
		}
	}

	const resources = new ResourceLoader();

	const dom = { window } = await Jsdom.JSDOM.fromFile(file, {
		resources,
		beforeParse,
		// resources: 'usable',
		pretendToBeVisual: true,
		runScripts: 'dangerously',
		url: `file://${folder}/`
	});

	// console.log(JSON.stringify(window.location, null, '\t'));
	// console.log(window.document.querySelector('base').href);

	const scripts = Array.from(window.document.querySelectorAll('script'));

	const oxeScript = scripts.find(function (script) {
		return script.src.includes('oxe.js') || script.src.includes('oxe.min.js');
	});

	let routePosition = 0;

	const afterRoute = function () {
		const component = window.Oxe.location.route.component;

		if (!('element' in component)) {
			component.element = window.document.querySelector(component.name);
		}

		const scope = component.name + '-' + component.count++;

		component.element.scope = scope;

		window.Oxe.component.render(component.element, component);
		window.Oxe.binder.bind(component.element, component.element, component.element.scope);

		// console.log(dom.serialize());

		const route = window.Oxe.router.data[++routePosition];

		if (route) {
			window.Oxe.router.route(route.path);
		}

		// console.log(window.Oxe.router.data);
		// console.log(window.Oxe.binder.data[component.element.scope]);
	};

	const afterLoad = function () {
		window.Oxe.loader.type.js = 'es';

		window.Oxe.general.setup({
			// base: folder
			base: folder + '/'
		});

		// console.log(window.document.querySelector('base').href);

		// window.Oxe.router.on('route:before', function () {
		// 	console.log(window.Oxe.location);
		// });

		window.Oxe.router.on('route:after', afterRoute);
	};

	oxeScript.addEventListener('load', afterLoad);

};
