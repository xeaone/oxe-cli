const Vm = require('vm');
const Fs = require('fs');
const Url = require('url');
const Util = require('util');
const Path = require('path');
const Jsdom = require('jsdom');

const Stat = Util.promisify(Fs.stat);
const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const WriteFolder = Util.promisify(Fs.mkdir);

const LoadOxeScript = async function (window, path) {
	const query = window.document.querySelectorAll('script');
	const scripts = Array.from(query);

	const oxeScript = scripts.find(function (script) {
		return script.src.includes('oxe');
	});

	const indexScript = scripts.find(function (script) {
		return script.src.includes('index');
	});

	if (!oxeScript) throw new Error('Oxe Compile - oxe script tag required');

	const oxePath = oxeScript.getAttribute('src');
	const oSetup = oxeScript.getAttribute('o-setup');

	if (!indexScript && !oSetup) throw new Error('Oxe Compile - index script tag or o-setup required');

	console.log('oxe:', Path.join(path, oxePath));
	const oxeData = await ReadFile(Path.join(path, oxePath), 'utf8');

	window.eval(oxeData);

	if (oSetup) {
		const indexPath = oSetup.split(/\s+|\s*,+\s*/)[0];
		// console.log('index:', Path.join(path, indexPath));
	} else {
		const indexPath = indexScript.getAttribute('src');
		console.log('index:', Path.join(path, indexPath));
		const indexData = await ReadFile(Path.join(path, indexPath), 'utf8');
		window.eval(indexData);
	}

	return new Promise(function (resolve, reject) {
		window.Oxe.router.on('route:after', resolve);
	});

};

const OxeRouteRender = function () {
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
};

module.exports = async function (input, output) {

	input = Path.resolve(process.cwd(), input);
	output = Path.resolve(process.cwd(), output);

	if (!Fs.existsSync(input)) throw new Error('Oxe Compile - input path does not exist');
	if (!Fs.existsSync(output)) throw new Error('Oxe Compile - output path does not exist');

	const stat = await Stat(input);

	const folder = stat.isDirectory() ? input : Path.dirname(input);
	const file = stat.isFile() ? input : Path.join(input, 'index.html');

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

	const dom = { window } = await Jsdom.JSDOM.fromFile(file, {
		beforeParse,
		url: `file://${input}/`,
		userAgent: 'node.js',
		contentType: 'text/html',
		runScripts: 'outside-only',
		pretendToBeVisual: true
	});

	const baseTag = window.document.querySelector('base');
	if (!baseTag) throw new Error('Oxe Compile - requires base tag');
	const baseUserHref = baseTag.getAttribute('href');
	const baseHref = `${input}/`;
	baseTag.href = baseHref;

	console.log('base:', baseTag.href);

	await LoadOxeScript(window, input);

	for (const route of window.Oxe.router.data) {
		console.log('route:', route.path);

		await window.Oxe.router.route(route.path);
		await OxeRouteRender(window);

		baseTag.href = baseUserHref;

		const outputFolder = Path.join(output, window.Oxe.location.route.path);

		if (!Fs.existsSync(outputFolder)) {
			await WriteFolder(outputFolder);
		}

		const outputFile = Path.join(outputFolder, 'index.html');

		await WriteFile(outputFile, dom.serialize(), 'utf8');

		baseTag.href = baseHref;
	}

};
