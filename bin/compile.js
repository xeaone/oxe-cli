const Vm = require('vm');
const Fs = require('fs');
const Util = require('util');
const Path = require('path');
const Jsdom = require('jsdom');

const Stat = Util.promisify(Fs.stat);
const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const WriteFolder = Util.promisify(Fs.mkdir);

module.exports = async function (data) {

	const input = Path.resolve(data.input);
	const output = Path.resolve(data.output);

	if (!Fs.existsSync(input)) throw new Error('Oxe Compile - input path does not exist');
	if (!Fs.existsSync(output)) throw new Error('Oxe Compile - output path does not exist');

	const stat = await Stat(input);

	const folder = stat.isDirectory() ? input : Path.dirname(input);
	const file = stat.isFile() ? input : Path.join(input, 'index.html');
	const baseHref = `file://${folder}/`;

	const beforeParse = function (window) {

		const polyPath = Path.join(__dirname, '../lib/', 'poly.js');
		const polyData = Fs.readFileSync(polyPath, 'utf8');
		window.eval(polyData);

		// const polyTwoPath = Path.join(__dirname, '../node_modules/oxe/dst/poly.min.js');
		// const polyTwoData = Fs.readFileSync(polyTwoPath, 'utf8');
		// window.eval(polyTwoData);

		window.scroll = function () {};
		window.customElements = { define: function () {} };
		window.HTMLUnknownElement = Object.create(window.Element.prototype, {});
	};

	class ResourceLoader extends Jsdom.ResourceLoader {
		fetch(url, options) {

			if (url.slice(0, 'file://'.length) === 'file://') {
				url = url.slice('file://'.length);
			}

			if (url.slice(0, folder.length) === folder) {
				url = url.slice(folder.length);
			}

			url = Path.join(folder, url);

			return super.fetch(`file://${url}`, options);
		}
	}

	const resources = new ResourceLoader();

	const dom = { window } = await Jsdom.JSDOM.fromFile(file, {
		resources,
		beforeParse,
		url: baseHref,
		userAgent: 'node.js',
		contentType: 'text/html',
		runScripts: 'dangerously',
		pretendToBeVisual: true,
	});

	const baseTag = window.document.querySelector('base');

	if (!baseTag) throw new Error('Oxe Compile - requires base tag');

	const baseUserHref = baseTag.getAttribute('href');

	baseTag.href = baseHref;

	const scripts = Array.from(window.document.querySelectorAll('script'));

	const oxeScript = scripts.find(function (script) {
		return script.src.includes('oxe');
	});

	let routePosition = 0;

	const route = function () {
		const component = window.Oxe.location.route.component;

		if ('element' in component === false) {
			component.element = window.document.querySelector(component.name);

	        Object.defineProperties(component.element, {
				created:{
					value: false,
					enumerable: true,
					configurable: true
				},
				scope: {
				enumerable: true,
					value: component.name + '-' + component.count++
				},
				model: {
					enumerable: true,
					get: function () {
						return  window.Oxe.model.get(this.scope);
					},
					set: function (data) {
						data = data && typeof data === 'object' ? data : {};
						return  window.Oxe.model.set(this.scope, data);
					}
				},
				methods: {
					enumerable: true,
					get: function () {
						return  window.Oxe.methods.get(this.scope);
					}
				}
			});

	        window.Oxe.model.set(component.element.scope, component.model);
	        window.Oxe.methods.set(component.element.scope, component.methods);
		}

		window.Oxe.component.render(component.element, component);
		window.Oxe.binder.bind(component.element, component.element, component.element.scope);

		baseTag.href = baseUserHref;

		const outputRouteFolder = Path.join(output, window.Oxe.location.route.path);

		Promise.resolve().then(function () {
			if (window.Oxe.location.route.path === '/') return;
			return WriteFolder(outputRouteFolder);
		}).then(function () {
			return WriteFile(Path.join(outputRouteFolder, 'index.html'), dom.serialize(), 'utf8');
		}).then(function () {
			baseTag.href = baseHref;
			const route = window.Oxe.router.data[++routePosition];
			if (route) window.Oxe.router.route(route.path);
		}).catch(console.error);

	};

	const load = function () { window.Oxe.router.on('route:after', route); };
	oxeScript.addEventListener('load', load);
};
