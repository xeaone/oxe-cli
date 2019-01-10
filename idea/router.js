
module.exports = {

	data: [],

    on () {},

	add (data) {
		if (!data) return;
		const type = data.constructor === Array ? 'apply' : 'call';
		Array.prototype.push[type](this.data, data);
		return data;
	}

};
