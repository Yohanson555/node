const _ = require('lodash');
const Handlebars = require('./Handlebars');

class TicketEngine {
    constructor(driver) {
        this.driver = driver;

        if (!this.driver)
            throw new Error('Ticket engine driver not provided');
    }

    setHelpers(helpers) {
        if (_.size(helpers) > 0) {
            _.each(helpers, (fn, name) => {
                Handlebars.registerHelper(name, fn);
            });
        } else {
            throw new Error('No helpers passed');
        }
    }

    compile(tpl, data, settings) {
		const renderer = Handlebars.compile(tpl);
		const res = renderer({ data, settings });

		return res;
	}

    async run(template = '', data = {}, settings = {}) {
        const { driver } = this;

        try {
            const ttml = this.compile(template, data, settings)

            await driver.render(ttml);

            return driver.flush();
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = TicketEngine;