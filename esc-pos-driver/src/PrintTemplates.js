//js icon - http://j-mccormick.com/wp-content/uploads/2017/10/icon.png

const imgTemplate = `
    <br>
    <br>
    <br>
    <br>
    <center>
    <img source="D:/REPOS/4.NODE_PROJECTS/esc-pos-driver/gru.jpg">
    </center>
    <br><br><br><br><cut>
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

const complexTemplate = `<center>{{company}}</center> 
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
<center><qr data="http://www.dev.untill.com" size="8"/></center>
<br><br><br><br>
<cut />`;

module.exports = {
    billTemplate,
    complexTemplate,
    orderTemplate,
    imgTemplate
}