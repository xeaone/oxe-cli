
# Oxe CLI
Oxe command line interface program for Oxe applications.

## Install
`npm i -g oxe-cli`

## CLI

- **Usage**

	- `oxe <operation> [...]`

- **Operations**

- `-h, --help`
- `-v, --version`

- `-c, --compile <input> <output>` Compiles to a static project.
	- `-m, --minify`
	- `-c, --comment`
	- `-t, --transpile`

- `-b, --bundle <input> <output>` Bundles a project.
	- `-m, --minify`
	- `-c, --comment`
	- `-t, --transpile`
	- `-n, --name <name>`

- `-s --serve <input>` Serves a static or spa project.
	- `-s, --spa`
	- `-c, --cors`

## Authors
[AlexanderElias](https://github.com/AlexanderElias)

## License
[Why You Should Choose MPL-2.0](http://veldstra.org/2016/12/09/you-should-choose-mpl2-for-your-opensource-project.html)
This project is licensed under the MPL-2.0 License
