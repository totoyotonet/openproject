import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor';

// import OpTableWidget from './plugins/op-table/src/op-table';

function Markdown( editor ) {
  editor.data.processor = new GFMDataProcessor();
}


export class OPClassicEditor extends ClassicEditor {}
export class OPBalloonEditor extends BalloonEditor {}

window.BalloonEditor = OPBalloonEditor;
window.ClassicEditor = OPClassicEditor;

const config = {
  plugins: [
    Markdown,
    EssentialsPlugin,
    AutoformatPlugin,
    BoldPlugin,
    ItalicPlugin,
    BlockquotePlugin,
    HeadingPlugin,
    ImagePlugin,
    ImagecaptionPlugin,
    ImagestylePlugin,
    ImagetoolbarPlugin,
    LinkPlugin,
    ListPlugin,
    ParagraphPlugin
  ],
  config: {
    toolbar: [
      'headings',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'undo',
      'redo'
    ],
    image: {
      toolbar: [
        'imageStyleFull',
        'imageStyleSide',
        '|',
        'imageTextAlternative'
      ]
    }
  }
};

OPClassicEditor.build = config;
OPBalloonEditor.build = config;
