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

    async run(data, template) {
        const { driver } = this;

        await driver.build(data, template, Handlebars);

        return driver.flush();
    }
}

module.exports = TicketEngine;