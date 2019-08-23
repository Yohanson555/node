const net = require('net');
const iconv = require('iconv-lite');

class TcpPrinter {
    constructor(host, port) {
        this.host = host;
        this.port = port ? parseInt(port) : 9100;
        this.timeout = 5000;

        this.codepage = 'cp866'

        if (!this.host || typeof this.host !== 'string') 
            throw new Error('Printer host not specified');

        if (!this.port || typeof this.port !== 'number') 
            throw new Error('Printer port not specified');
    }

    send(data, callback = null ) {
        const { port, host, timeout } = this;
        const t = timeout > 0 ? parseInt(timeout) : 5000;
        const connection = net.createConnection(port, host);

        const encoding = codepage || this.codepage || 'cp866';
        connection.setTimeout(t);

        connection.on('connect', () => {
            console.log(`- Connected to printer ${host}:${port}`);
            console.log(`-- Sending data.`);

            connection.write(data, callback);
            connection.destroy();
        });

        connection.on('error', (e) => {
            console.log(`- Connection to printer ${host}:${port} failed`);
            console.log(e);
        });

        connection.on('timeout', () => {
            console.log(`- Connection to printer ${host}:${port} closed due to timeout in ${t} ms.`);
        });
    }
}

module.exports = TcpPrinter;