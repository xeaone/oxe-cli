
export default {
	title: 'about',
	path: './about',
	component: {
		name: 'r-about',
		model: {
			text: 'hello world'
		},
		created: function () {
			console.log('about route created');
		},
		template: `
			<h2>About</h2>
			<h3 o-text="text"></h3>
		`
	}
}
