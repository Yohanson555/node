const avro = require('avsc');

const Firebird = require('node-firebird');
const options = require('./config'); 


var button_type = avro.parse({
    type: 'record',
    name: 'funcButton',
    fields: [
      {name: 'buttonText', type: ['null', 'string']},
      {name: 'number', type: ['null', 'int']},
      {name: 'image', type: 'string'},
      {name: 'icon', type: ['null', 'string']},
      {name: 'iconColor', type: ['null', 'string']},
      {name: 'action', type: ['null', 'string']},
      {name: 'data', type: ['null', 'string']},
    ]
  });

  var tab_type = avro.parse({
    type: 'record',
    name: 'funcTab',
    fields: [
      {name: 'tabName', type:'string'},
      {name: 'number', type: 'int'},
      {name: 'buttons', type: {type: 'array', items: button_type}},
    ]
  });

  var func_panel_type = avro.parse({
    type: 'record',
    name: 'funcPanel',
    fields: [
      {name: 'defaultTabNumber', type: 'int'},
      {name: 'tabs', type: {type: 'array', items: tab_type}}
    ]
  });

  var buf = func_panel_type.toBuffer({
    defaultTabNumber: 0,
    tabs: [
        {
            tabName: '',
            number: 0,
            buttons: [
                {
                    buttonText: 'button text #1',
                    number: 0,
                    image: 'https://dev.untill.com/files/air-proto/eagle.png',
                    icon: '',
                    iconColor: '#000000',
                    action: 'functionName',
                    data: `{'a': 1, 'b': 2}`
                },
                {
                  buttonText: 'button text #1',
                  number: 1,
                  image: 'https://dev.untill.com/files/air-proto/eagle.png',
                  icon: '',
                  iconColor: '#000000',
                  action: 'functionName',
                  data: `{'a': 1, 'b': 2}`
                },
                {
                  buttonText: 'button text #1',
                  number: 2,
                  image: '',
                  icon: 'icon name',
                  iconColor: '#ffffff',
                  action: 'functionName',
                  data: `{'a': 1, 'b': 2}`
              }
            ]
        }
    ],
}); 
/*
console.log(buf);

    console.log('---');

    var str = buf.toString();
    console.log(str);

    console.log('---');

    var val = func_panel_type.fromBuffer(buf); // {kind: 'CAT', name: 'Albert'}

    console.log(val);
*/

//var updQuery = 'update SETTINGS set FUNCTIONS = ? where ID = ?';

var selQuery = 'select FUNCTIONS from SETTINGS where ID = ?';


/*
Firebird.attach(options, (er, db) => {
    if (er) throw new Error(er);
    var str = buf.toString();
    console.log(str);
    db.query(updQuery, ["", 25000091040], (err, result) => {
        if (err) throw new Error(err);

        console.log('query #1 success');

        db.detach();
    });
});
*/

Firebird.attach(options, (er, db) => {
    if (er) throw new Error(er);

    db.query(selQuery, [25000091040], (err, rows) => {
        if (err) throw err;

        rows[0].FUNCTIONS(function(err, name, e) {
 
            if (err)
                throw err;
 
            // +v0.2.4
            // e.pipe(writeStream/Response);
 
            // e === EventEmitter
            e.on('data', function(chunk) {
                // reading data
            });
 
            e.on('end', function() {
                // end reading
                // IMPORTANT: close the connection
                db.detach();
            });
        });

        console.log('query #2 success');

        db.detach();
    });
});
