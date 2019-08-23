const Image = require('./src/Escpos/Image');


const src = 'js.png';

const image = new Image(src);
image.load().catch(e => {
    console.error(e);
});
