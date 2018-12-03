var options = {
	container: 'wikiPageEditor',
	basePath: '/vendor/epiceditor',
	parser: marked,
	textarea: 'wikiPage',
	theme: {
	base: '/themes/base/epiceditor.css',
	preview: '/themes/preview/preview-dark.css',
	editor: '/themes/editor/epic-dark.css'
	},		
}

var editor = new EpicEditor(options).load();