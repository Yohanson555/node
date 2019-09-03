var fsDither = require("floyd-steinberg-dithering");
 
// Must have a file with same name as src path at the location
 
// process the floyd steinberg dithering
fsDither.process('./mac.jpg', './mac2.jpg');