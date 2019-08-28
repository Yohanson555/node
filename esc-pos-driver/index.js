const { parse } = require('react-native-parse-html');

const TcpPrinter = require('./lib/TcpPrinter');
const TicketEngine = require('./lib/TicketEngine');

const EscPosDriver = require('./src/Escpos/Driver');
const PrintTemplates = require('./src/PrintTemplates');
const helpers = require('./src/Helpers');

const data = require('./data/data');

const host = '192.168.117.211';
const port = 9100;

const printer = new TcpPrinter(host, port);

const driver = new EscPosDriver(parse, {});
const template = PrintTemplates.complexTemplate;
//const template = PrintTemplates.billTemplate;

const engine = new TicketEngine(driver);
engine.setHelpers(helpers);

engine.run(data, template)
    .then((ticket) => {
        printer.send(ticket)
    });

