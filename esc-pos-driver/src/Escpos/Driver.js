const _ = require('./Commands');
const Image = require('./Image');
const { MutableBuffer } = require('mutable-buffer');
const iconv = require('iconv-lite');

class EscPosDriver {
	constructor(parser, options = {}) {
		if (!parser)
			throw new Error('HTML parser not initialized');

		this.parser = parser;
		this.buffer = new MutableBuffer();

		this.options = {
			width: 576,
			fontType: 'A',
			fontSize: 1,
			fontLogo: '',
			barWidth: 2,
			barHeight: 255,
			barType: 0,
			qrSize: 4,
			barHri: 0
		};

		if (options && typeof options === 'object') {
			this.options = { ...this.options, options };
		}

		this.ticketWidth = this.options.width || 576;
		this.characterSize = 14;

		this.currentFontSize = this.options.fontSize || 1;
		this.currentFontType = this.options.fontType || 'A';
		this.currentStyle = 'left';

		this.fontSizeStack = [];
		this.styleStack = [];

		this.model = null; //qsprinter
		this.encoding = 'cp866';
	}

	minifyHTML(html) {
		const reg = new RegExp(/(\s{2,})|(\n)|(\t)/, 'ig');
		return html.replace(reg, '');
	}

	async render(html) {
		const nodes = this.parser(this.minifyHTML(html));
		let fz = this.options.fontSize || 1;

		this.setDefaults();
		this.setFontSize(fz, fz);
		this.setAlignCode(this.currentStyle);
		this.setFontCode(this.currentFontType);

		await this.renderNode(nodes, null);

		return this;
	}

	flush() {
		return this.buffer.flush();
	}

	setDefaults() {
		this.buffer = new MutableBuffer();
		this.buffer.write(_.HARDWARE.HW_INIT);

		return this;
	}

	setAlignCode(a) {
		let pref = '';

		if (a && typeof a === 'string') {
			this.styleStack.push(this.currentStyle);
			this.currentStyle = a.toLowerCase().trim();

		} else {
			pref = _.LF;
			this.currentStyle = this.styleStack.pop();
		}

		switch (this.currentStyle) {
			case 'center': this.buffer.write(pref + _.TEXT_FORMAT.TXT_ALIGN_CT); break;
			case 'right': this.buffer.write(pref + _.TEXT_FORMAT.TXT_ALIGN_RT); break;
			default: this.buffer.write(pref + _.TEXT_FORMAT.TXT_ALIGN_LT); break;
		}

		return this;
	}

	setFontCode(f) {
		const font = f.toLowerCase().trim();

		switch (font) {
			case 'b': this.buffer.write(_.TEXT_FORMAT.TXT_FONT_B); break;
			case 'c': this.buffer.write(_.TEXT_FORMAT.TXT_FONT_C); break;
			default: this.buffer.write(_.TEXT_FORMAT.TXT_FONT_A); break;
		}

		return this;
	}

	setFontSize(...attr) {
		if (attr.length === 2) {
			let width = parseInt(attr[0] || 1);
			let height = parseInt(attr[1] || 1);

			if (width > 9 || width < 1) width = 1;
			if (height > 9 || height < 1) height = 1;

			const widthDec = (width - 1) * 16;
			const heightDec = (height - 1);

			this.fontSizeStack.push(this.currentFontSize);
			this.currentFontSize = widthDec + heightDec;
		} else {
			this.currentFontSize = this.fontSizeStack.pop();
		}

		this.buffer.write(_.TEXT_FORMAT.TXT_CUSTOM_SIZE(this.currentFontSize));

		return this;
	}

	getQRCode(node) {
		let qr = this.getNodeAttr(node, 'data');

		if (qr !== '') {
			const dots = this.getQRSize(node); // The dot size of the QR code

			if (qr.length >= 256) {
				qr = qr.slice(0, 256);
			}

			// Some proprietary size calculation
			const size1 = String.fromCharCode(qr.length + 3);
			const size0 = '\x00'; // Always 0 unless qr length > 256 characters

			this.buffer.write('\x1D\x28\x6B\x04\x00\x31\x41\x32\x00'); // <Function 165> select the model (model 2 is widely supported)
			this.buffer.write(`\x1D\x28\x6B\x03\x00\x31\x43${dots}`); // <Function 167> set the size of the module
			this.buffer.write('\x1D\x28\x6B\x03\x00\x31\x45\x30'); // <Function 169> select level of error correction (48,49,50,51) printer-dependent
			this.buffer.write(`\x1D\x28\x6B${size1}${size0}\x31\x50\x30${qr}`); // <Function 180> send your data (testing 123) to the image storage area in the printer
			this.buffer.write('\x1D\x28\x6B\x03\x00\x31\x51\x30'); // <Function 181> print the symbol data in the symbol storage area
			this.buffer.write('\x1D\x28\x6B\x03\x00\x31\x52\x30'); // <Function 182> Transmit the size information of the symbol data in the symbol storage area
		}

		return this;
	}

	getQRSize(node = null, s = null) {
		let size = s;

		if (!size) {
			if (node) {
				size = parseInt(this.getNodeAttr(node, 'size') || this.options.qrSize || 4, 10);
			} else {
				size = 4;
			}
		}

		switch (size) {
			case 0: return '\x00';
			case 1: return '\x01';
			case 2: return '\x02';
			case 3: return '\x03';
			case 4: return '\x04';
			case 5: return '\x05';
			case 6: return '\x06';
			case 7: return '\x07';
			case 8: return '\x08';
			default: return '\x01';
		}
	}

	getBARCode(node) {
		var code = this.getNodeAttr(node, 'data');

		var width = this.getBarCodeWidth(node);
		var height = this.getBarCodeHeight(node);

		var position = this.getBarCodePosition(node);

		var type = this.getBarCodeType(node); //'EAN13';
		var font = this.getBarCodeFont(node); //'A';

		var includeParity = true;

		type = type || 'EAN13'; // default type is EAN13, may a good choice ?
		var convertCode = String(code), parityBit = '', codeLength = '';

		if (typeof type === 'undefined' || type === null)
			throw new TypeError('barcode type is required');

		if (type === 'EAN13' && convertCode.length !== 12)
			throw new Error('EAN13 Barcode type requires code length 12');

		if (type === 'EAN8' && convertCode.length !== 7)
			throw new Error('EAN8 Barcode type requires code length 7');

		if (this._model === 'qsprinter')
			this.buffer.write(_.MODEL.QSPRINTER.BARCODE_MODE.ON);

		if (this._model === 'qsprinter') {
			// qsprinter has no BARCODE_WIDTH command (as of v7.5)
		} else if (width >= 2 || width <= 6) {
			this.buffer.write(_.BARCODE_FORMAT.BARCODE_WIDTH[width]);
		} else {
			this.buffer.write(_.BARCODE_FORMAT.BARCODE_WIDTH_DEFAULT);
		}

		if (height >= 1 || height <= 255) {
			this.buffer.write(_.BARCODE_FORMAT.BARCODE_HEIGHT(height));
		} else {
			if (this._model === 'qsprinter') {
				this.buffer.write(_.MODEL.QSPRINTER.BARCODE_HEIGHT_DEFAULT);
			} else {
				this.buffer.write(_.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT);
			}
		}

		if (this._model !== 'qsprinter')
			this.buffer.write(_.BARCODE_FORMAT['BARCODE_FONT_' + (font || 'A').toUpperCase()]);

		this.buffer.write(position);

		this.buffer.write(_.BARCODE_FORMAT['BARCODE_' + ((type || 'EAN13').replace('-', '_').toUpperCase())]);

		if (type === 'EAN13' || type === 'EAN8') {
			parityBit = this.getParityBit(code);
		}

		if (type == 'CODE128' || type == 'CODE93') {
			codeLength = this.codeLength(code);
		}

		this.buffer.write(codeLength + code + (includeParity ? parityBit : '') + '\x00'); // Allow to skip the parity byte
		if (this._model === 'qsprinter') {
			this.buffer.write(_.MODEL.QSPRINTER.BARCODE_MODE.OFF);
		}

		return this;
	}

	getBarCodePosition(node = null) {
		let hri = null;

		if (node) {
			hri = this.getNodeAttr(node, 'hri');
		}

		hri = parseInt(hri || this.options.barHri || 0, 10);

		if (hri < 0 && hri > 3) {
			hri = 0;
		}

		switch (hri) {
			case 1: return _.BARCODE_FORMAT.BARCODE_TXT_ABV; // HRI barcode chars above
			case 2: return _.BARCODE_FORMAT.BARCODE_TXT_BLW; // HRI barcode chars below
			case 3: return _.BARCODE_FORMAT.BARCODE_TXT_BTH; // HRI barcode chars both above and below
			default: return _.BARCODE_FORMAT.BARCODE_TXT_OFF; // HRI barcode chars OFF
		}
	}

	getBarCodeWidth(node = null) {
		let width = null;

		if (node) {
			width = this.getNodeAttr(node, 'width');
		}

		width = parseInt(width || this.options.barWidth || 4, 10);

		if (width < 2 || width > 6 || !width) width = 4;

		return width;
	}

	getBarCodeHeight(node = null) {
		let height = null;

		if (node) {
			height = this.getNodeAttr(node, 'height');
		}

		height = parseInt(height || this.options.barHeight || 100, 10);

		if (height < 1 || height > 255 || !height) height = 100;

		return height;
	}

	getBarCodeType(node = null) {
		let type = null;

		if (node) {
			type = this.getNodeAttr(node, 'type');
		}

		type = parseInt(type || this.options.barType || 0, 10);

		if (!type || type < 0 || type > 8) {
			type = 3;
		}

		switch (type) {
			case 1: return 'UPC_A';
			case 2: return 'UPC_E';
			case 3: return 'EAN13';
			case 4: return 'EAN8';
			case 5: return 'CODE39';
			case 6: return 'ITF';
			case 7: return 'NW7';
			case 8: return 'CODE93';
			case 9: return 'CODE128';
			default: return 'EAN13';
		}
	}

	getBarCodeFont(node) {
		let font = "A";

		if (node) {
			font = String(this.getNodeAttr(node, 'font'));

			if (font.toUpperCase() !== 'B')
				font = 'A';
		}

		return font.toUpperCase();
	}

	async getImage(node) {
		const source = this.getNodeAttr(node, 'src') || '-';
		let width = parseInt(this.getNodeAttr(node, 'width') || this.options.width);

		//console.log('getImage() source', source);

		if (width > this.options.width || width <= 0) {
			width = parseInt(this.options.width);
		}

		const density = 'D24';

		if (source && typeof source === 'string') {
			const image = new Image(source, true, width);

			await image.load();

			this.renderImage(image, density)
		}

		return this;
	}

	renderImage(image, density = null) {
		var n = ['d8', 's8'].indexOf(density) >= 0 ? 1 : 3;
		var header = _.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];

		var bitmap = image.toBitmap(n * 8);
		var self = this;

		this.lineSpace(0);

		bitmap.data.forEach(async (line) => {
			self.buffer.write(header);
			self.buffer.writeUInt16LE(line.length / n);
			self.buffer.write(line);
			self.buffer.write(_.EOL);
		});

		return this.lineSpace();
	}

	/*
	renderImage(image, density) {
		density = 'D8';
		const imageBits = image.data;
		const bytes = ['s8', 'd8'].indexOf(density) >= 0 ? 1 : 3;
		console.log('bytes', bytes);

		// COMMANDS
		var selectBitImageModeCommand = `${_.BITMAP_FORMAT[`BITMAP_${density.toUpperCase()}`]}`;

		var setLineSpacing24Dots = `${_.LINE_SPACING.LS_SET}\x18`;
		var setLineSpacing30Dots = `${_.LINE_SPACING.LS_SET}\x1e`;

		this.buffer.write('\x1b\x40');
		this.buffer.write(setLineSpacing24Dots);

		var offset = 0;

		while (offset < image.getHeight()) {
			this.buffer.write(selectBitImageModeCommand);
			this.buffer.writeUInt16LE(image.getWidth());

			var imageDataLineIndex = 0;
			var imageDataLine = new Array();

			for (var x = 0; x < image.getWidth(); ++x) {
				for (var k = 0; k < bytes; ++k) {
					var byte = 0;

					for (var b = 0; b < 8; ++b) {
						var y = ((((offset / 8) | 0) + k) * 8) + b;

						var i = (y * image.getWidth()) + x;

						var v = 0;

						if (i < imageBits.length) {
							v = imageBits[i];
						}

						byte |= (v << (7 - b));
					}

					imageDataLine[imageDataLineIndex + k] = byte;
				}

				imageDataLineIndex += bytes;
			}

			offset += bytes * 8;

			this.buffer.write(imageDataLine);
			this.buffer.write('\x0A');
		}


		this.buffer.write(setLineSpacing30Dots);

		return this;
	}
	*/

	async getRaster(node) {
		const source = this.getNodeAttr(node, 'src') || '-';
		const mode = this.getNodeAttr(node, 'mode') || null;

		let width = parseInt(this.getNodeAttr(node, 'width') || this.options.width);

		if (width > this.options.width || width <= 0) {
			width = parseInt(this.options.width);
		}
		if (source && typeof source === 'string') {
			const image = new Image(source, false, width);

			await image.load();

			this.renderRaster(image, mode)
		}

		return this;
	}

	renderRaster(image, mode = null) {
		mode = mode || 'normal';
		if (mode === 'dhdw' ||
			mode === 'dwh' ||
			mode === 'dhw') mode = 'dwdh';

		var raster = image.toRaster();
		var header = _.GSV0_FORMAT['GSV0_' + mode.toUpperCase()];

		this.buffer.write(header);
		this.buffer.writeUInt16LE(raster.width);
		this.buffer.writeUInt16LE(raster.height);
		this.buffer.write(raster.data);

		return this;
	};

	getLineCode(node) {
		let symbol = this.getNodeAttr(node, 'symbol') || '-';

		symbol = String(symbol)[0];

		node.innerText = '';
		node.innerHTML = '';

		this.buffer.write(`${symbol.repeat(this.ticketWidth / (this.characterSize * (Math.floor(this.currentFontSize / 16) + 1)))}\x0a`);

		return this;
	}

	getNodeAttr(node, attrName) {
		if (node.attrs && node.attrs.length > 0) {
			for (let i = 0; i < node.attrs.length; i++) {
				const attr = node.attrs[i];

				if (attr.name === attrName) {
					return attr.value;
				}
			}
		}

		return null;
	}

	async getRowCode(node) {
		let freeCount = 0;
		let freeSize = this.ticketWidth / (this.characterSize * (Math.floor(this.currentFontSize / 16) + 1));
		let row = '';

		if (node.childNodes && node.childNodes.length > 0) {
			for (let i = 0; i < node.childNodes.length; i++) {
				const nodeChild = node.childNodes[i];

				if (nodeChild.nodeName === 'cell') {
					const width = parseInt(this.getNodeAttr(nodeChild, 'width'), 10) || 0;
					if (width > 0) {
						freeSize -= width;
					} else {
						freeCount++;
					}
				}
			}

			const freeCellSize = freeSize / freeCount;

			for (let k = 0; k < node.childNodes.length; k++) {
				const nodeChild = node.childNodes[k];

				if (nodeChild.nodeName === 'cell') {
					const width = parseInt(this.getNodeAttr(nodeChild, 'width'), 10) || 0;
					const align = this.getNodeAttr(nodeChild, 'align');
					let res = await this.renderNode(nodeChild, []);

					let nodeText = res.join(' ');
					const len = nodeText.length;
					let cellSize = freeCellSize;

					if (width > 0) {
						cellSize = width;
					}

					if (len > cellSize) {
						nodeText = nodeText.slice(0, cellSize - 3);
						nodeText = `${nodeText}.. `;
					} else {
						const l = cellSize - len;
						if (align === 'right') {
							nodeText = ' '.repeat(l) + nodeText;
						} else {
							nodeText += ' '.repeat(l);
						}
					}

					row += nodeText;
				}
			}
		}

		this.text(`${row}\x0a`);

		return this;
	}

	getMargin(node, type) {
		let value = this.getNodeAttr(node, 'value');

		value = Number(value) || 0;

		switch (type) {
			case 'left': return this.marginLeft(value);
			case 'right': return this.marginRight(value);
			default: return this.marginBottom(value);
		}
	}

	write(data) {
		this.buffer.write(data);
		return this;
	}

	text(content) {
		this.write(iconv.encode(content, this.encoding));
		return this;
	}

	async renderNode(node, code = null) {
		const nodeName = String(node.nodeName).replace('#', '').trim().toLowerCase();

		let w; let h;

		switch (nodeName) {
			case 'center': // set content align
			case 'left':
			case 'right':
				this.setAlignCode(nodeName);
				break;
			case 'line': // print line of characters
				this.getLineCode(node);
				break;
			case 'row': // prints table-like row with cells of predefined width
				await this.getRowCode(node);
				return code;
			case 'ds': // set double font size
				this.setFontSize(2, 2);
				break;
			case 'qs': // set tripple font size
				this.setFontSize(3, 3);
				break;
			case 'fs': // set custom font size in range from 1 to 10
				s = parseInt(this.getNodeAttr(node, 'size') || 1, 10);

				if (w >= 0 && h >= 0) this.setFontSize(s, s);
				break;
			case 'b': // set bold mode on
				this.buffer.write(_.TEXT_FORMAT.TXT_BOLD_ON);
				break;
			case 'u': // set underline mode on
				this.buffer.write(_.TEXT_FORMAT.TXT_UNDERL_ON);
				break;
			case 'i': // set italic mode on
				this.buffer.write(_.TEXT_FORMAT.TXT_ITALIC_ON);
				break;
			case 't': //tab
				this.buffer.write(_.FEED_CONTROL_SEQUENCES.CTL_HT);
				break;
			case 'vt': //vertical tab
				this.buffer.write(_.FEED_CONTROL_SEQUENCES.CTL_VT);
				break;
			case 'mb': //matgin bottom
				this.getMargin(node, 'bottom');
				break;
			case 'ml': //margin left
				this.getMargin(node, 'left');
				break;
			case 'mr': //margin right
				this.getMargin(node, 'right');
				break;
			case 'qr': //print qrcode
				this.getQRCode(node);
				break;
			case 'bar': //print barcode
				this.getBARCode(node);
				break;
			case 'img': //print bit image
				await this.getImage(node);
				break;
			case 'rimg': //print raster image
				await this.getRaster(node);
				break;
			default: break;
		}

		if (node.childNodes && node.childNodes.length > 0) {
			for (let i = 0; i < node.childNodes.length; i++) {
				await this.renderNode(node.childNodes[i], code);
			}
		} else if (node && node.value && node.value !== '') {
			if (code) {
				code.push(node.value);
			} else {
				this.text(node.value)
			}
		}

		switch (nodeName) {
			case 'center': // pop content align from stack
			case 'left':
			case 'right':
				this.setAlignCode(null);
				break;
			case 'ds': // pop font size from stack
			case 'qs':
			case 'fs':
				this.setFontSize();
				break;
			case 'b': // set bold off
				this.buffer.write(_.TEXT_FORMAT.TXT_BOLD_OFF);
				break;
			case 'u': // set underline off
				this.buffer.write(_.TEXT_FORMAT.TXT_UNDERL_OFF);
				break;
			case 'i': // set italic off
				this.buffer.write(_.TEXT_FORMAT.TXT_ITALIC_OFF);
				break;
			case 'cut': // cut paper
				this.buffer.write(_.LF.repeat(5));
				this.buffer.write(_.PAPER.PAPER_CUT);
				break;
			case 'pcut': // cut paper
				this.buffer.write(_.LF.repeat(5));
				this.buffer.write(_.PAPER.PAPER_CUT);
				break;
			case 'br': // new line and feed paper
				this.buffer.write(_.EOL);
				break;
			default: break;
		}

		return code;
	}

	unicodeStringToTypedArray(s) {
		const escstr = encodeURIComponent(s);
		const binstr = escstr.replace(/%([0-9A-F]{2})/g,
			(_, p1) => {
				return String.fromCharCode(`0x${p1}`);
			});

		const ua = new Uint8Array(binstr.length);

		Array.prototype.forEach.call(binstr, (ch, i) => {
			ua[i] = ch.charCodeAt(0);
		});

		return ua;
	}

	lineSpace(n) {
		if (n === undefined || n === null) {
			this.buffer.write(_.LINE_SPACING.LS_DEFAULT);
		} else {
			this.buffer.write(_.LINE_SPACING.LS_SET);
			this.buffer.writeUInt8(n);
		}

		return this;
	};

	marginBottom(size) {
		this.buffer.write(_.MARGINS.BOTTOM);
		this.buffer.writeUInt8(size);

		return this;
	};

	marginLeft(size) {
		this.buffer.write(_.MARGINS.LEFT);
		this.buffer.writeUInt8(size);

		return this;
	};

	marginRight(size) {
		this.buffer.write(_.MARGINS.RIGHT);
		this.buffer.writeUInt8(size);

		return this;
	};

	getParityBit(str) {
		var parity = 0, reversedCode = str.split('').reverse().join('');

		for (var counter = 0; counter < reversedCode.length; counter += 1) {
			parity += parseInt(reversedCode.charAt(counter), 10) * Math.pow(3, ((counter + 1) % 2));
		}

		return String((10 - (parity % 10)) % 10);
	};

	codeLength(str) {
		let buff = Buffer.from((str.length).toString(16), 'hex');

		return buff.toString();
	}
}

module.exports = EscPosDriver;
