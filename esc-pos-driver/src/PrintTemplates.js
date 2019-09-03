//js icon - http://j-mccormick.com/wp-content/uploads/2017/10/icon.png

const imgTemplate = `
<center>
<img src="D:/REPOS/4.NODE_PROJECTS/esc-pos-driver/mac.png" width="400">
</center>
<cut>
`;

const smplTemplate = `
<br>
<br>
<br>
<center>
line 1123123123123
</center>

<right> right text</right>

<left> left text </left>
<br>
line 2
<br>
<br>
<br>
<br>
<mb value="5">
---
<cut>
`;

const billTemplate = `<br />
<center>
    <ds><b>* BILL #{{billNum}} *</b></ds>
</center>
<br>
{{bill_date}}
<br>
{{#items_list items}}
    <u>
        <row>
            <cell>{{name}}</cell>
            <cell width="3">{{quantity}}</cell>
            <cell width="8" align="right">{{item_price}}</cell>
        </row>
    </u>
    {{#options_list options}}
        <u>
            <row>
                <cell width="2"></cell>
                <cell>+ {{name}} {{text}}</cell>
                <cell width="8" align="right">{{item_price}}</cell>
            </row>
        </u>
    {{/options_list}}
{{/items_list}}

<br>
{{total_sum items}}
<br>
<center>
    <qr data="12347890123" size="4">
</center>
<br><br>
<center>
<bar type="1" data="12345678901" width="4" height="70" hri="1">
</center>
<br><br><br><br><br><cut>`;


const orderTemplate = `<center>
    <ds><b>* NEW ORDER *</b></ds>
</center>
<center>
    <ds><b>* TABLE {{table}} *</b></ds>
</center>
<center>
    <b>{{parea.NAME}}</b>
</center>
<br />
{{order_date}}
<br />

{{#items_list items}}
    <u>
        <row>
            <cell>{{name}}</cell>
            <cell width="3">{{quantity}}</cell>
        </row>
    </u>
    {{#options_list options}}
        <u>
            <row>
                <cell width="2"></cell>
                <cell>+ {{name}} {{text}}</cell>
            </row>
        </u>
    {{/options_list}}
{{/items_list}}
<br><br><br><br><br><br><cut>`;

const complexTemplate = `
<center><img src="D:/REPOS/4.NODE_PROJECTS/esc-pos-driver/mac.png" width="200"></center>
<center>{{company}}</center> 
<center>{{address}}</center>
<center>{{site}}</center>
<center>{{contacts}}</center>
<line symbol="=" />
<row>
    <cell>ККТ № 009007214</cell>
    <cell align="right">ИННЖ 7710044132</cell>
</row><br>
<left>Заказ № {{orderNum}}</left>
<line symbol="=" />
<center>
    <ds><b>* КАССОВЫЙ ЧЕК *</b></ds>
</center>
<center>
    <ds><b>* ПРИХОД *</b></ds>
</center><br>{{#items_by_department departments items}}<u>
    <row>
        <cell>{{name}}</cell>
        <cell width="3">{{quantity}}</cell>
        <cell width="8">{{vat_name}}</cell>
        <cell width="8" align="right">{{item_price}}</cell>
    </row>
</u>{{/items_by_department}}<br>{{total_sum items}}
<t />
<t />В т.ч. налоги<br>{{#vat_list items}}<u>
    <row>
        <cell width="20">{{name}}</cell>
        <cell align="right">{{value}}</cell>
    </row>
</u>{{/vat_list}}<br>
<line symbol="*" />

<row>
    <cell><i>ОПЛАТА КАРТОЙ</i></cell>
    <cell align="right">259.00</cell>
</row>
<line symbol="*" />КАССИР {{waiter}}<br>ДАТА {{date}}
<t />
<t />
<t />
<t />
<t />
<t /> ВРЕМЯ {{time}}<br>
<row>
    <cell>ДОК № {{doc}}</cell>
    <cell align="right">ПРИХОД {{prihod}}</cell>
</row>
<row>
    <cell width="15">Касса № {{drawer}}</cell>
    <cell align="right">ФН: ЭКЗ.№ {{fn}}</cell>
</row>
<row>
    <cell>РЕГ. № {{reg}}</cell>
    <cell width="20" align="right">СМЕНА № {{smena}}</cell>
</row>СИСТ. НАЛОГООБЛ.: ОБЩАЯ<br>
<t />
<t />ФД №1472
<t />
<t />
<t />
<t />
<t />
<t />
<t />ФП=1421230762<br><br>
<center>
<qr data="http://www.dev.untill.com" size="8"/>
</center>
<br><br><br><br>
<cut />`;

const codesTemplate = `
<br />
<center>
<bar type="1" data="123456789012" width="4" height="70" hri="1">
<br />
</center>
<br />
`;

const qrTemplate = `
<qr data="http://www.dev.untill.com" size="0"/>
<br>
<qr data="http://www.dev.untill.com" size="1"/>
<br>
<qr data="http://www.dev.untill.com" size="2"/>
<br>
<qr data="http://www.dev.untill.com" size="3"/>
<br>
<qr data="http://www.dev.untill.com" size="4"/>
<br>
<qr data="http://www.dev.untill.com" size="5"/>
<br>
<qr data="http://www.dev.untill.com" size="6"/>
<br>
<qr data="http://www.dev.untill.com" size="7"/>
<br>
<qr data="http://www.dev.untill.com" size="8"/>
<br>
<qr data="http://www.dev.untill.com" size="9"/>
<cut />
`;

const barTemplate = `
<bar type="3" data="123456789012" width="2" height="50" hri="1">
<br>
<bar type="3" data="123456789012" width="3" height="80" hri="1">
<br>
<bar type="3" data="123456789012" width="4" height="110" hri="1">
<br>
<bar type="3" data="123456789012" width="5" height="140" hri="1">
<br>
<bar type="3" data="123456789012" width="6" height="170" hri="1">
<br>
<cut />
`;

const fsTemplate = `
<fs width='1' height='1'>test</fs><br>
<fs width='2' height='2'>test</fs><br>
<fs width='3' height='3'>test</fs><br>
<fs width='4' height='4'>test</fs><br>
<fs width='5' height='5'>test</fs><br>
<fs width='6' height='6'>test</fs><br>
<fs width='7' height='7'>test</fs><br>
<fs width='8' height='8'>test</fs><br>
<fs width='9' height='9'>test</fs><br>
<cut>
`;

const ticketTemplate = `
{{#condition 'showTopImage' 1}}
    <center>
        <img {{{attribute "topImage" "src"}}} {{{attribute "topImageWidth" "width"}}} />
    </center>
{{/condition}}
<br>
<center>{{value "company" ''}}</center> 
<center>{{data.address}}</center>
<center>{{data.site}}</center>
<center>{{data.contacts}}</center>

<line symbol="=" />

<row>
    <cell>ККТ № 009007214</cell>
    <cell align="right">ИННЖ 7710044132</cell>
</row><br>

<left>Заказ № {{data.orderNum}}</left>

<line symbol="=" />

<center>
    <ds><b>** КАССОВЫЙ ЧЕК **</b></ds>
</center>

<center>
    <ds><b>* ПРИХОД *</b></ds>
</center>

<br>
{{#condition 'listType' '1'}}
    {{#items_list data.items}}
        <u>
            <row>
                <cell>{{name}}</cell>
                <cell width="3">{{quantity}}</cell>
                <cell width="8">{{vat_name}}</cell>
                <cell width="8" align="right">{{item_price}}</cell>
            </row>
        </u>
    {{/items_list}}<br>
{{/condition}}

{{#condition 'listType' '2'}}
    {{#items_by_department data.departments data.items}}
        <u>
            <row>
                <cell>{{name}}</cell>
                <cell width="3">{{quantity}}</cell>
                <cell width="8">{{vat_name}}</cell>
                <cell width="8" align="right">{{item_price}}</cell>
            </row>
        </u>
    {{/items_by_department}}<br>
{{/condition}}

{{total_sum data.items}}

{{#condition 'showVats' 1}}
    <center>
        В т.ч. налоги
    </center>

    {{#vat_list data.items}}
        <u>
            <row>
                <cell width="20">{{name}}</cell>
                <cell align="right">{{value}}</cell>
            </row>
        </u>
    {{/vat_list}}
{{/condition}}
<br>
<br>
<line symbol="*" />
<row>
    <cell><i>ОПЛАТА</i></cell>
    <cell align="right">259.00</cell>
</row>
<line symbol="*" /><br>
КАССИР {{data.waiter}}<br>ДАТА {{date}}
<t />
<t />
<t /> ВРЕМЯ {{data.time}}<br>
<row>
    <cell>ДОК № {{data.doc}}</cell>
    <cell align="right">ПРИХОД {{data.prihod}}</cell>
</row>
<row>
    <cell width="15">Касса № {{data.drawer}}</cell>
    <cell align="right">ФН: ЭКЗ.№ {{data.fn}}</cell>
</row>
<row>
    <cell>РЕГ. № {{data.reg}}</cell>
    <cell width="20" align="right">СМЕНА № {{data.smena}}</cell>
</row>СИСТ. НАЛОГООБЛ.: ОБЩАЯ<br>
<t />ФД №1472
<t />ФП=1421230762<br><br>
<br>

<center>
    {{#condition 'showQR' 1}}
        <qr data="1234567" size="{{{value "qrSize" "8"}}}"></qr>
    {{/condition}}

    {{#condition 'showBar' 1}}
        <br>
        <bar data="123456789012" type="3" width="{{{value "barWidth" "4"}}}" height="{{{value "barHeight" "70"}}}" hri="1"></bar>
    {{/condition}}
</center>

<br>

{{#condition 'showBottomImage' 1}}
    <br>
        <center>
            <img {{{attribute "bottomImage" "src"}}} {{{attribute "bottomImageWidth" "width"}}} />
        </center>
    <br>    
{{/condition}}

<br><cut />
`;

module.exports = {
    billTemplate,
    complexTemplate,
    orderTemplate,
    imgTemplate,
    smplTemplate,
    codesTemplate,
    qrTemplate,
    barTemplate,
    fsTemplate,
    ticketTemplate
}