
module.exports = async function (options) {
	options = options || {};

	if (options.router) {
		this.router.add(options.router.routes);
	}

	for (const route of this.router.data) {
		let routeName;
		let routeTemplate
		let routeStyle = '';

		route.title = route.title || '';
		route.compile = route.compile || {};
		route.compile.head = route.compile.head || '';

		if (typeof route.component === 'string') {
			// route.component =
		}

		if (typeof route.component === 'object') {

			if (route.component.style) {
				routeStyle = `<style>${route.component.style}</style>\n`;
			}

			routeName = route.component.name || '';
			routeTemplate = route.component.template || '';
		}

		const data = template
			.replace(
				Global.oRouterPlaceholder,
				`<o-router>\n\t\t<${routeName} o-scope="${routeName}-0">\n${routeStyle}${routeTemplate}\n\t\t</${routeName}>\n</o-router>`
			).replace(
				Global.oHeadPlaceholder,
				route.compile.head
			).replace(
				Global.oTitlePlaceholder,
				route.title
			);

		let path = route.path;
		path = path === '/' ? path = '/index.html' : path;
		path = Path.extname(path) === '.html' ? path : Path.join(path, 'index.html');

		files.push({
			path: path,
			data: data
		});

	}

};
