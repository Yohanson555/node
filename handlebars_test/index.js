const Handlebars = require('handlebars');

Handlebars.registerHelper('condition', function(prop, value, options) {
    if (this.settings && this.settings[prop] === value) {
        return options.fn(this);
    }

    return null;
});

Handlebars.registerHelper('attribute', function(prop, name, options) {
    if (this.settings && this.settings[prop]) {
        return `${name}="${this.settings[prop]}"`;
    }

    return null;
});

Handlebars.registerHelper('value', function(prop, dflt = null, options) {
    if (this.settings && this.settings[prop]) {
        return this.settings[prop];
    } else if (dflt) {
        return dflt;
    }

    return '';
});

Handlebars.registerHelper('test', function(prop, dflt = null, options) {
    return 'test 1';
});

Handlebars.registerHelper('test', function(prop, dflt = null, options) {
    return 'test 2';
});

Handlebars.unregisterHelper()

const data = {
    header: 'This is header',
    body: 'This is body',
    footer: 'This is footer'
};

const settings = {
    showHeader: false,
    showBody: true,
    showFooter: true,
    fontType: 'A',
    textAlign: 1
}

const template = `
<content>
    {{#condition 'showHeader' true}}
        <header>{{data.header}}</header>
    {{/condition}}

    <body {{{attribute "fontType" "font"}}}>{{data.body}}</body>

    <footer align="{{{value "textAlign" "left"}}}">{{data.footer}}</footer>

    {{test}}
</content>
`;

const result = Handlebars.compile(template);

console.log(result({
    data,
    settings
}));

