'use strict';

const Vm = require('vm');
const Path = require('path');
const Global = require('./global');

module.exports = async function (inputIndexJsContent, template) {
	const files = [];

	Vm.runInNewContext(inputIndexJsContent, {
		Oxe: {
			global: {},
			component: {
				define: function (c) {
					return function () {
						return c;
					}
				}
			},
			router: {
				data: [],
                on: function () {},
				add: function (data) {
					if (!data) return;
					var type = data.constructor.name === 'Array' ? 'apply' : 'call';
					Array.prototype.push[type](this.data, data);
					return data;
				}
			},
			setup: function (options) {

				options = options || {};

				if (options.router) {
					this.router.add(options.router.routes);
				}

				for (let route of this.router.data) {
					let routeName;
					let routeTemplate
					let routeStyle = '';

					route.title = route.title || '';
					route.compile = route.compile || {};
					route.compile.head = route.compile.head || '';

					if (typeof route.component === 'string') {
						routeName = route.component;
					} else if (typeof route.component === 'object') {

						if (route.component.style) {
							routeStyle = `<style>${route.component.style}</style>\n`;
						}

						routeName = route.component.name || '';
						routeTemplate = route.component.template || '';
					}

					let data = template.replace(
						Global.oRouterPlaceholder,
						`<o-router>\n\t\t<${routeName} o-scope="${routeName}-0">\n${routeStyle}${routeTemplate}\n\t\t</${routeName}>\n</o-router>`
					);

					data = data.replace(Global.oHeadPlaceholder, route.compile.head);
					data = data.replace(Global.oTitlePlaceholder, route.title);

					let path = route.path;
					path = path === '/' ? path = '/index.html' : path;
					path = Path.extname(path) === '.html' ? path : Path.join(path, 'index.html');

					files.push({
						path: path,
						data: data
					});

				}

			}
		}
	});

	return files;
};
