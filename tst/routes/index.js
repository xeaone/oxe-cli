
export default {
	title: 'index',
	path: './index',
	component: {
		name: 'r-index',
		model: {
			dynamic: 'hello world'
		},
		created: function () {
			console.log('created');
		},
		template: `
			<h2>Index</h2>
			<h3 o-text="dynamic"></h3>
		`
	}
}
