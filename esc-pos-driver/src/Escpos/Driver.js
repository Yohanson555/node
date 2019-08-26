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
			width: 800,
			fontType: 'A',
			fontSize: 1,
			fontLogo: '',
			barWidth: 2,
			barHeight: 255,
			barType: 0,
			qrSize: 4,
			barHri: 0
		};

		this.options = {
			...this.options,
			options
		};

		this.ticketWidth = this.options.width || 576;
		this.characterSize = 20;

		this.fontSizeStack = [];

		this.currentFontType = this.options.fontType || 'A';

		this.styleStack = [];
		this.currentStyle = 'left';

		this.encoding = 'cp866';
	}

	compileTemplate(data, tpl, templater) {
		const template = templater.compile(tpl);
		const res = template(data);

		return res;
	}

	minifyHTML(html) {
		const reg = new RegExp(/(\s{2,})|(\n)|(\t)/, 'ig');
		return html.replace(reg, '');
	}

	async render(html) {
		const nodes = this.parser(this.minifyHTML(html));
		const code = [];

		let fz = this.options.fontSize || 1;
		
		this.setFontSize(fz, fz);
		this.setAlignCode(this.currentStyle);
		this.setFontCode(this.currentFontType);

		await this.renderNode(nodes, code);

		return this;
	}

	flush() {
		return this.buffer.flush();
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
			const width = attr[0] || 1;
			const height = attr[1] || 1;

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

	getQRSize(node = null) {

		const code = this.getNodeAttr(node, 'data');
		const size = this.getNodeAttr(node, 'size');
		const version = this.getNodeAttr(node, 'version');
		const level = this.getNodeAttr(node, 'level');

		if (this._model !== 'qsprinter') {
			this.buffer.write(_.CODE2D_FORMAT.TYPE_QR);
			this.buffer.write(_.CODE2D_FORMAT.CODE2D);
			this.buffer.writeUInt8(version || 3);
			this.buffer.write(_.CODE2D_FORMAT[
				'QR_LEVEL_' + (level || 'L').toUpperCase()
			]);
			this.buffer.writeUInt8(size || 6);
			this.buffer.writeUInt16LE(code.length);
			this.buffer.write(code);
		} else {
			const dataRaw = iconv.encode(code, 'utf8');

			if (dataRaw.length < 1 && dataRaw.length > 2710) {
				throw new Error('Invalid code length in byte. Must be between 1 and 2710');
			}

			// Set pixel size
			if (!size || (size && typeof size !== 'number'))
				size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.DEFAULT;
			else if (size && size < _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MIN)
				size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MIN;
			else if (size && size > _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MAX)
				size = _.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.MAX;

			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PIXEL_SIZE.CMD);
			this.buffer.writeUInt8(size);

			// Set version
			if (!version || (version && typeof version !== 'number'))
				version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.DEFAULT;
			else if (version && version < _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MIN)
				version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MIN;
			else if (version && version > _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MAX)
				version = _.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.MAX;

			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.VERSION.CMD);
			this.buffer.writeUInt8(version);

			// Set level
			if (!level || (level && typeof level !== 'string'))
				level = _.CODE2D_FORMAT.QR_LEVEL_L;
				
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.LEVEL.CMD);
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.LEVEL.OPTIONS[level.toUpperCase()]);

			// Transfer data(code) to buffer
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.SAVEBUF.CMD_P1);
			this.buffer.writeUInt16LE(dataRaw.length + _.MODEL.QSPRINTER.CODE2D_FORMAT.LEN_OFFSET);
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.SAVEBUF.CMD_P2);
			this.buffer.write(dataRaw);

			// Print from buffer
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PRINTBUF.CMD_P1);
			this.buffer.writeUInt16LE(dataRaw.length + _.MODEL.QSPRINTER.CODE2D_FORMAT.LEN_OFFSET);
			this.buffer.write(_.MODEL.QSPRINTER.CODE2D_FORMAT.PRINTBUF.CMD_P2);
		}

		return this;
	}

	/*
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
	}*/

	getBARCode(node) {
		const data = this.getNodeAttr(node, 'data');

		if (data) {
			const width = this.getBarCodeWidth(node);
			const height = this.getBarCodeHeight(node);
			const type = this.getBarCodeType(node);
			const hri = this.getBarHriPosition(node);


			const barcode = `${hri}\x1d\x68${String.fromCharCode(height)}\x1d\x77${String.fromCharCode(width)}\x1d\x6b${type}${String.fromCharCode(data.length)}${data}`;

			this.buffer.write(barcode);
		}

		return this;
	}

	getBarHriPosition(node = null) {
		let hri = null;

		if (node) {
			hri = this.getNodeAttr(node, 'hri');
		}

		hri = parseInt(hri || this.options.barHri || 0, 10);

		if (hri < 0 && hri > 3) {
			hri = 0;
		}

		switch (hri) {
			case 1: return '\x1d\x48\x01';
			case 2: return '\x1d\x48\x02';
			case 3: return '\x1d\x48\x03';
			default: return '\x1d\x48\x00';
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

		if (type < 0 || type > 8) {
			type = 0;
		}

		switch (type) {
			case 1: return '\x42';
			case 2: return '\x43';
			case 3: return '\x44';
			case 4: return '\x45';
			case 5: return '\x46';
			case 6: return '\x47';
			case 7: return '\x48';
			case 8: return '\x49';
			default: return '\x41';
		}
	}

	async getImage(node, density) {
		const source = this.getNodeAttr(node, 'source') || '-';

		if (source && typeof source === 'string') {
			const image = new Image(source);

			await image.load2();

			this.renderImage(image, density)
		}

		return this;
	}

	renderImage(image, density) {
		density = 's8';
		var n = !!~['d8', 's8'].indexOf(density) ? 1 : 3;

		var header = _.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
		var bitmap = image.toBitmap(n * 8);

		this.lineSpace(0);

		bitmap.data.forEach((line) => {
			this.buffer.write(header);
			this.buffer.writeUInt16LE(line.length / n);
			this.buffer.write(line);
			this.buffer.write(_.LF);
		});

		return this.lineSpace();;
	};

	async getRaster(node) {
		const source = this.getNodeAttr(node, 'source') || '-';

		if (source && typeof source === 'string') {
			const image = new Image(source);
			await image.load();

			this.renderRaster(image, density)
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
		const symbol = this.getNodeAttr(node, 'symbol') || '-';

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
					let res = await this.renderNode(nodeChild);
					let nodeText = 'test';
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

		this.buffer.write(`${row}\x0a`);

		return this;
	}

	getMargin(node, type) {
		let value = this.getNodeAttr(node, 'value');

		value = Number(value) || 0;

		switch(type) {
			case 'left': return this.marginLeft(value);
			case 'right': return this.marginRight(value);
			default: return this.marginBottom(value);
		}
	}

	getText(node) {
		const text = node.value;

		if (text) this.text(text);
	}

	write(data) {
		this.buffer.write(data);

		return this;
	}

	text(content) {
		this.write(iconv.encode(content, this.encoding));
	}
	

	async renderNode(node, code = []) {
		const nodeName = String(node.nodeName).replace('#', '').trim().toLowerCase();

		let w; let h;

		switch (nodeName) {
			case 'center':
			case 'left':
			case 'right':
				this.setAlignCode(nodeName);
				break;
			case 'line':
				this.getLineCode(node);
				break;
			case 'row':
				return this.getRowCode(node);
			case 'ds':
				this.setFontSize(2, 2);
				break;
			case 'qs':
				this.setFontSize(3, 3);
				break;
			case 'fs':
				w = parseInt(this.getNodeAttr(node, 'width') || 1, 10);
				h = parseInt(this.getNodeAttr(node, 'height') || 1, 10);

				if (w >= 0 && h >= 0) this.setFontSize(w, h);
				break;
			case 'b':
				this.buffer.write(_.TEXT_FORMAT._BOLD_ON);
				break;
			case 'u':
				this.buffer.write(_.TEXT_FORMAT.TXT_UNDERL_ON);
				break;
			case 'i':
				this.buffer.write(_.TEXT_FORMAT.TXT_ITALIC_ON);
				break;
			case 't':
				this.buffer.write(_.FEED_CONTROL_SEQUENCES.CTL_HT);
				break;
			case 'vt':
				this.buffer.write(_.FEED_CONTROL_SEQUENCES.CTL_VT);
				break;
			case 'mb':
				this.getMargin(node, 'bottom');
				break;
			case 'ml':
				this.getMargin(node, 'left');
				break;
			case 'mr':
				this.getMargin(node, 'right');
				break;
			case 'qr':
				this.getQRCode(node);
				break;
			case 'bar':
				this.getBARCode(node);
				break;
			case 'img':
				await this.getImage(node);
				break;
			case 'text': 
				return this.getText(node);
			default: break;
		}

		//console.log(`open tag: ${ nodeName}`);

		if (node.childNodes && node.childNodes.length > 0) {
			for (let i = 0; i < node.childNodes.length; i++) {
				await this.renderNode(node.childNodes[i], code);
			}
		}

		//console.log(`close tag: ${ nodeName}`);

		switch (nodeName) {
			case 'center':
			case 'left':
			case 'right':
				this.setAlignCode(null);
				break;
			case 'ds':
			case 'qs':
			case 'fs':
				this.setFontSize();
				break;
			case 'b':
				this.buffer.write(_.TEXT_FORMAT.TXT_BOLD_OFF);
				break;
			case 'u':
				this.buffer.write(_.TEXT_FORMAT.TXT_UNDERL_OFF);
				break;
			case 'i':
				this.buffer.write(_.TEXT_FORMAT.TXT_ITALIC_OFF);
				break;
			case 'cut':
				this.buffer.write(_.PAPER.PAPER_CUT);
				break;
			case 'pcut':
				this.buffer.write(_.PAPER.PAPER_CUT);
				break;
			case 'br':
				this.buffer.write(_.EOL);
				break;
			default: break;
		}

		return this;
	}

	unicodeStringToTypedArray(s) {
		const escstr = encodeURIComponent(s);
		const binstr = escstr.replace(/%([0-9A-F]{2})/g,
			(match, p1) => {
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

	async build(data, tpl, templater) {
		const ttml = this.compileTemplate(data, tpl, templater);

		return this.render(ttml, false);
	}
}

module.exports = EscPosDriver;
