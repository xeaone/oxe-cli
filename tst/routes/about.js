
export default {
	title: 'about',
	path: './about',
	component: {
		name: 'r-about',
		model: {
			dynamic: 'hello world'
		},
		created: function () {
		},
		template: `
			<h2>About</h2>
			<h3 o-text="dynamic"></h3>
		`
	}
}
