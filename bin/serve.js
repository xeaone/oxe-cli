'use strict';

const Porty = require('porty');
const Servey = require('servey');

module.exports = async function (data) {
	const port = await Porty.find(8080);

	const server = Servey.create({
		port: port,
		spa: data.spa,
		cors: data.cors,
		folder: data.input
	});

	await server.open();

	return server;
};
