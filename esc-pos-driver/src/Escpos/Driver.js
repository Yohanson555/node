const Image = require('./Image');
const { MutableBuffer } = require('mutable-buffer');

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
		const fz = this.options.fontSize || 1;
		this.currentFontSize = this.getFontSize(fz, fz);
        
        this.currentFontType = this.options.fontType || 'A';

		this.styleStack = [];
		this.currentStyle = 'left';

		this.asArray = false;
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
		const { asArray } = this;
        const nodes = this.parser(this.minifyHTML(html));
		const code = [];
		
        code.push(this.getAlignCode(this.currentStyle));
        code.push(this.getSizeCode(this.currentFontSize));
		code.push(this.getFontCode(this.currentFontType));
		
		const res = await this.renderNode(nodes, code);
		
        if (asArray) {
            return this.unicodeStringToTypedArray(res);
        }

		return code.join('');
	}
	
	getAlignCode(a) {
		const align = a.toLowerCase().trim();
		
		switch (align) {
			case 'center': return '\x1b\x61\x01';
			case 'right': return '\x1b\x61\x02';
			default: return '\x1b\x61\x00';
		}
	}
	
	getFontCode(f) {
		const font = f.toLowerCase().trim();
		
		switch (font) {
			case 'b': return '\x1b\x4d\x01';
			case 'c': return '\x1b\x4d\x02';
			default: return '\x1b\x4d\x00';
		}
	}
	
	getFontSize(w, h) {
		const width = w || 1;
		const height = h || 1;

        const widthDec = (width - 1) * 16;
		const heightDec = (height - 1);
		
        return widthDec + heightDec;
	}

	getSizeCode(sizeDec) {
        return `\x1d\x21${String.fromCharCode(sizeDec)}`;
	}

	getQRCode(node) {
		let qr = this.getNodeAttr(node, 'data');

		if (qr !== '') {
			// The QR data

			// The dot size of the QR code
			const dots = this.getQRSize(node);

			if (qr.length >= 256) {
				qr = qr.slice(0, 256);
			}

			// Some proprietary size calculation
			const size1 = String.fromCharCode(qr.length + 3);
			const size0 = '\x00'; // Always 0 unless qr length > 256 characters
					
			const data = [ 
				'\x1D\x28\x6B\x04\x00\x31\x41\x32\x00',	// <Function 165> select the model (model 2 is widely supported)			
				`\x1D\x28\x6B\x03\x00\x31\x43${dots}`, // <Function 167> set the size of the module
				'\x1D\x28\x6B\x03\x00\x31\x45\x30', // <Function 169> select level of error correction (48,49,50,51) printer-dependent
				`\x1D\x28\x6B${size1}${size0}\x31\x50\x30${qr}`, // <Function 180> send your data (testing 123) to the image storage area in the printer
				'\x1D\x28\x6B\x03\x00\x31\x51\x30', // <Function 181> print the symbol data in the symbol storage area
				'\x1D\x28\x6B\x03\x00\x31\x52\x30', // <Function 182> Transmit the size information of the symbol data in the symbol storage area
			];

			return data.join('');
		}

		return '';
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
		const data = this.getNodeAttr(node, 'data');

		if (data) {
			const width = this.getBarCodeWidth(node);
			const height = this.getBarCodeHeight(node);
			const type = this.getBarCodeType(node);
			const hri = this.getBarHriPosition(node);
			
			return `${hri}\x1d\x68${String.fromCharCode(height)}\x1d\x77${String.fromCharCode(width)}\x1d\x6b${type}${String.fromCharCode(data.length)}${data}`;
		}

		return '\x0a';
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

	async getImage(node) {
		const source = this.getNodeAttr(node, 'source') || '-';

		if (source && typeof source === 'string') {
			const image = new Image(source);
			await image.load();

			const res = image.render2();

			return res;
		}
		

		return '';
	}

	getLineCode(node) {
		const symbol = this.getNodeAttr(node, 'symbol') || '-';

		node.innerText = '';
		node.innerHTML = '';

		return `${symbol.repeat(this.ticketWidth / (this.characterSize * (Math.floor(this.currentFontSize / 16) + 1)))}\x0a`;
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
                    let nodeText = res.join('');
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

		return `${row}\x0a`;
	}
	
	async renderNode(node, code = []) {
		const nodeName = String(node.nodeName).replace('#', '').trim().toLowerCase();

		let w; let h;

		switch (nodeName) {
			case 'center': 
				this.styleStack.push(this.currentStyle);
				this.currentStyle = 'center';
				code.push(this.getAlignCode(this.currentStyle));
				break;
			case 'left': 
				this.styleStack.push(this.currentStyle);
				this.currentStyle = 'left';
				code.push(this.getAlignCode(this.currentStyle));
				break;
			case 'right': 
				this.styleStack.push(this.currentStyle);
				this.currentStyle = 'right';
				code.push(this.getAlignCode(this.currentStyle));
				break;
			case 'line': 
				code.push(this.getLineCode(node));
				break;
			case 'row': 
                code.push(await this.getRowCode(node));
                return code;
			case 'br': 
				code.push('\x0a');
				break;
			case 'ds':
				this.fontSizeStack.push(this.currentFontSize);
				this.currentFontSize = this.getFontSize(2, 2);
				code.push(this.getSizeCode(this.currentFontSize));
				break;
			case 'qs': 
				this.fontSizeStack.push(this.currentFontSize);
				this.currentFontSize = this.getFontSize(3, 3);
				code.push(this.getSizeCode(this.currentFontSize));
				break;
			case 'fs': 
				w = parseInt(this.getNodeAttr(node, 'width') || 1, 10);
				h = parseInt(this.getNodeAttr(node, 'height') || 1, 10);

				if	(w >= 0 && h >= 0) {
					this.fontSizeStack.push(this.currentFontSize);
					this.currentFontSize = this.getFontSize(w, h);
					code.push(this.getSizeCode(this.currentFontSize));	
				}

				break;
			case 'b': 
				code.push('\x1b\x45\x01');
				break;
			case 'u': 
				code.push('\x1b\x2d\x01');
				break;
			case 'i': 
				code.push('\x1b\x34');
				break;
			case 't': 
				code.push('  ');
				break;
			case 'qr': 
				code.push(this.getQRCode(node));
				return code;
			case 'bar': 
				code.push(this.getBARCode(node));
				return code;
			case 'img':
				let res = await this.getImage(node);
				code.push(res);
				return code;
			default: break;
		}
		
		if (node.childNodes && node.childNodes.length > 0) {
			for (let i = 0; i < node.childNodes.length; i++) {
				await this.renderNode(node.childNodes[i], code);
			}
		} else if (node && node.value && node.value !== '') {
			code.push(node.value);
		}
		
		switch (nodeName) {
			case 'center': 
			case 'left': 
			case 'right': 
				this.currentStyle = this.styleStack.pop();
				code.push(`\x0a${this.getAlignCode(this.currentStyle)}`);
				break;
			case 'ds':
			case 'qs': 
			case 'fs': 
				this.currentFontSize = this.fontSizeStack.pop();
				code.push(this.getSizeCode(this.currentFontSize));
				break;
			case 'b': 
				code.push('\x1b\x45\x00');
				break;
			case 'u': 
				code.push('\x1b\x2d\x00');
				break;
			case 'i': 
				code.push('\x1b\x35');
				break;
            case 'cut':
                code.push('\x1d\x56\x00');
                break;
			default: break;
		}
		
		return code;
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
	
	async build(data, tpl, templater) {
		const ttml = this.compileTemplate(data, tpl, templater);
		//console.log('ttml:', ttml);
		return this.render(ttml, false);
	}
}

module.exports = EscPosDriver;
