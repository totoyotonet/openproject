const ClassicEditor = (require('@ckeditor/ckeditor5-editor-classic/src/classiceditor') as any).default;
const BalloonEditor = (require('@ckeditor/ckeditor5-editor-balloon/src/ballooneditor') as any).default;

const EssentialsPlugin = (require('@ckeditor/ckeditor5-essentials/src/essentials') as any).default;
const AutoformatPlugin = (require('@ckeditor/ckeditor5-autoformat/src/autoformat') as any).default;
const BoldPlugin = (require('@ckeditor/ckeditor5-basic-styles/src/bold') as any).default;
const ItalicPlugin = (require('@ckeditor/ckeditor5-basic-styles/src/italic') as any).default;
const BlockquotePlugin = (require('@ckeditor/ckeditor5-block-quote/src/blockquote') as any).default;
const HeadingPlugin = (require('@ckeditor/ckeditor5-heading/src/heading') as any).default;
const ImagePlugin = (require('@ckeditor/ckeditor5-image/src/image') as any).default;
const ImagecaptionPlugin = (require('@ckeditor/ckeditor5-image/src/imagecaption') as any).default;
const ImagestylePlugin = (require('@ckeditor/ckeditor5-image/src/imagestyle') as any).default;
const ImagetoolbarPlugin = (require('@ckeditor/ckeditor5-image/src/imagetoolbar') as any).default;
const LinkPlugin = (require('@ckeditor/ckeditor5-link/src/link') as any).default;
const ListPlugin = (require('@ckeditor/ckeditor5-list/src/list') as any).default;
const ParagraphPlugin = (require('@ckeditor/ckeditor5-paragraph/src/paragraph') as any).default;
// const GFMDataProcessor = (require('@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor') as any).default;

// import OpTableWidget from './plugins/op-table/src/op-table';
import OPImageUploadPlugin from './plugins/op-image-upload/op-image-upload';
import OPCommonMarkProcessor from './plugins/op-commonmark/op-commonmark';

function Markdown( editor:any ) {
  editor.data.processor = new OPCommonMarkProcessor();
}

declare global {
  var angular: any;
}

export class OPClassicEditor extends ClassicEditor {}
export class OPBalloonEditor extends BalloonEditor {}

(window as any).BalloonEditor = OPBalloonEditor;
(window as any).ClassicEditor = OPClassicEditor;

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
    ParagraphPlugin,
    OPImageUploadPlugin
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

(OPClassicEditor as any).build = config;
(OPBalloonEditor as any).build = config;
