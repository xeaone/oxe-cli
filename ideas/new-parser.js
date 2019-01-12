
const type = {
	SPECIAL: [
		'script','style'
	],
	CLOSE_SELF: [
		'colgroup','dd','dt','li','options',
		'p','td','tfoot','th','thead','tr'
	],
	EMPTY: [
		'area','base','basefont','br','col','frame','hr','img','input',
		'link','meta','param','embed','command','keygen','source','track','wbr'
	],
	FILL_ATTRIBUTES: [
		'checked','compact','declare','defer','disabled','ismap',
		'multiple','nohref','noresize','noshade','nowrap','readonly','selected'
	],
	INLINE: [
		'abbr','acronym','applet','b','basefont','bdo','big','br','button',
		'cite','code','del','dfn','em','font','i','iframe','img','input','ins',
		'kbd','label','map','object','q','s','samp','script','select','small',
		'span','strike','strong','sub','sup','textarea','tt','u','var'
	],
	BLOCK: [
		'a','address','article','applet','aside','audio','blockquote','button','canvas',
		'center','dd','del','dir','div','dl','dt','fieldset','figcaption','figure','footer',
		'form','frameset','h1','h2','h3','h4','h5','h6','header','hgroup','hr','iframe','ins',
		'isindex','li','map','menu','noframes','noscript','object','ol','output','p','pre','section',
		'script','table','tbody','td','tfoot','th','thead','tr','ul','video','svg'
	]
};

let attributeMode = false;
let tagStartMode = false;
let specialMode = false;
let stringMode = false;
let stringChar = '';

for (let i = 0, l = html.length; i < l; i++) {
	let char = html[i];

	if (specialMode) {

		if (stringMode) {

			if (
				(
					char === '\'' ||
					char === '\"' ||
					char === '\`'
				) &&
				stringChar === char &&
				html[i-1] !== '\\'
			) {
				stringChar = '';
				stringMode = false;
			}

			continue;
		}

		if (!stringMode && char === '\'' || char === '\"' || char === '\`') {
			stringChar = char;
			stringMode = true;
			continue;
		}

	}

	if (!char) {
		continue;
	} else if (html.slice(i, 8) === '<script>') {
		specialMode = true;
		i += 8;
	} else if (html.slice(i, 7) === '<style>') {
		specialMode = true;
		i += 7;
	} else if (html.slice(i, 4) === '<!--') {
		specialMode = true;
		i += 4;
	} else if (html.slice(i, 9) === '</script>') {
		specialMode = false;
		i += 9;
	} else if (html.slice(i, 8) === '</style>') {
		specialMode = false;
		i += 8;
	} else if (html.slice(i, 3) === '-->') {
		specialMode = false;
		i += 3;
	} else if (specialMode) {
		continue;
	} else if (!tagStartMode && !attributeMode && char === '<') {
		tagStartMode = true;
		attributeMode = false;
	} else if (tagStartMode && char === ' ') {
		tagStartMode = false;
		attributeMode = true;
	} else if (attributeMode && char === '>') {
		tagStartMode = false;
		attributeMode = true;
	}

}
