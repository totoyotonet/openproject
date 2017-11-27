import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import converters from './to-markdown/converters';
import MarkdownIt from 'markdown-it';
import toMarkdown from 'to-markdown';

/**
 * Markdown procesesing using markdown-it and toMarkdown instead of bundled
 * marked library the GFM plugin.
 *
 * Based on GFM processor plugin for CKEditor5, Copyright CKSource.
 * https://github.com/ckeditor/ckeditor5-markdown-gfm
 *
 */
export default class OPCommonMarkProcessor {
  public _htmlDP:any;

	constructor() {
		this._htmlDP = new HtmlDataProcessor();
	}

	toView(data) {
    var md = new MarkdownIt({
      html: true,
      linkify: true
    });

		const html = md.render(data);
		return this._htmlDP.toView(html);
	}

	toData(viewFragment) {
		const html = this._htmlDP.toData( viewFragment );
		return toMarkdown( html, { gfm: true, converters } );
	}
}

