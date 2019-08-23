const { Image } = require('image-js');

execute().catch(console.error);

async function execute() {
    let image = await Image.load('gru.jpg');

    
    const grey = image.grey({
        algorithm: 'lightness'
    });

    // we create a mask, which is basically a binary image
    // a mask has as source a grey image and we will decide how to determine
    // the threshold to define what is white and what is black
    var mask = grey.mask({
        algorithm: 'li'
    });

    //return mask.toBuffer();

    mask.save('gru.bmp', {format: 'bmp'})

}