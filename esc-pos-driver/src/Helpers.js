
const Handlebars = require('../lib/Handlebars');
const SafeString = Handlebars.SafeString;


function condition(prop, value, options) {
    if (this.settings && this.settings[prop] === value) {
        return options.fn(this);
    }

    return '';
};

function attribute(prop, name) {
    if (this.settings && this.settings[prop])
        return `${name}="${this.settings[prop]}"`;

    return '';
};

function value(prop, dflt = null) {
    if (this.settings && this.settings[prop]) {
        return this.settings[prop];
    } else if (dflt && typeof dflt !== 'object') {
        return dflt;
    }

    return '';
};

function item_price() {
    const price = parseFloat(this.price, 10) * parseInt(this.quantity, 10);
    return number_format(price, 2);
};

function total_sum(items) {
    let sum = 0;
    if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            sum += parseFloat(items[i].price) * parseInt(items[i].quantity, 10);

            if (items[i].options) {
                const opts = Object.values(items[i].options);

                for (let k = 0; k < opts.length; k++) {
                    sum += parseFloat(opts[k].price) * parseInt(items[i].quantity, 10);
                }
            }
        }
    }

    return new SafeString(`<ds><b><row><cell>TOTAL</cell><cell align='right'>*${number_format(sum, 2)}</cell></row></b></ds><br>`);
};

function order_date() {
    if (this.modified > 0) {
        return new SafeString(`<b><row><cell>Order datetime</cell><cell align='right'>${moment(this.modified).format('D.M.Y / hh:mm')}</cell></row></b><br>`);
    }
};

function bill_date() {
    if (this.modified > 0) {
        return new SafeString(`<b><row><cell>Bill datetime</cell><cell align='right'>${moment(this.modified).format('D.M.Y / hh:mm')}</cell></row></b><br>`);
    }
};

function items_list(items, opts) {
    return items.map((item) => {
        return opts.fn(item);
    }).join('');
};

function options_list(options, opts) {
    if (options) {
        return Object.values(options).map((item) => {
            return opts.fn(item);
        }).join('');
    }

    return '';
};

function vat_list(items, options) {
    let vats = {};
    let out = '';

    if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.vat_value > 0) {
                let vat = item.vat_value / 100;
                if (vats[item.vat_value]) {
                    vats[item.vat_value].value += item.price * item.quantity * vat;
                } else {
                    vats[item.vat_value] = {
                        name: item.vat_name,
                        value: item.price * item.quantity * vat
                    };
                }
            }
        }

        return Object.values(vats).map((item) => {
            item.value = number_format(item.value, 2)
            return options.fn(item);
        }).join('');
    }

    return '';
}

function items_by_department(departments, items, options) {
    var deps = {};
    if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const dep = item.department;

            if (deps[dep]) {
                deps[dep].items.push(item);
            } else {
                deps[dep] = {};
                deps[dep].name = departments[dep].name;
                deps[dep].items = [];
                deps[dep].items.push(item);
            }
        }
    }

    return Object.values(deps).map((dep) => {
        return "<b>" + dep.name + ":</b><br/>" + dep.items.map((item) => {
            return options.fn(item);
        }).join('') + "<br>";
    }).join('');
}

function number_format(number, decimals = 0, dec_point = '.', thousands_sep = ' ') {	// Format a number with grouped thousands
    var i, j, kw, kd, km;

    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if ((j = i.length) > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);

    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

    return km + kw + kd;
}

module.exports = {
    condition,
    attribute,
    value,
    item_price,
    total_sum,
    order_date,
    bill_date,
    items_list,
    options_list,
    vat_list,
    items_by_department
};