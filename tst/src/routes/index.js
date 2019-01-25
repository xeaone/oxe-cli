
export default {
	title: 'index',
	path: './index',
	component: {
		name: 'r-index',
		model: {
			text: 'hello world'
		},
		created: function () {
			console.log('index route created');
		},
		template: `
			<h2>Index</h2>
			<h3 o-text="text"></h3>
		`
	}
}
