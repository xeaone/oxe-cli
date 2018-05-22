'use strict';

const Porty = require('porty');
const Servey = require('servey');

module.exports = async function (data) {
	const port = await Porty.find(8000);

	const server = new Servey({
		port: port,
		cors: data.cors,
		routes: [
			{
				path: '*',
				method: 'get',
				handler: async function (context) {
					return await context.tool.static({
						spa: data.spa,
						folder: data.input,
						path: context.url.pathname
					});
				}
			}
		]
	});

	await server.open();

	return server;
};
