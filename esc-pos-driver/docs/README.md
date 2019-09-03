## Introduction
Describes ticket template base elements, they behaviour and available attrubutes.

## Overview
Any POS Printer driver should accept ticket TTML template 

## Terms
- `TTML` %- Ticket Template Markup Language %- HTML%-like tag markup language, that uses it's own set of tags and attributes and some of HTML tags.
- `TAG` %- named markup mark. There is three possible teg types:
  - open tag (example: `<center>`)
  - close tag (example: `</center>`)
  - selfslosing tag (example: `<br/>`)

The content between the open and close tags is displayed and placed in accordance with the attributes specified in the start tag and depending on the tag itself.

Each open tag should be closed with appropriate close tag. In other case ticket can be printed in unsuspectable way.

- `PRINTER` %- any TCP/IP printer that accepts ESC/POS commands set.
- `Tag attribute` %- (example `<line symbol="%*" />`) %- in the example `symbol="*"` construction is an attribute of `<line />` tag. attributes should be placed in the open tag or in the self%-closing tag befor `/>`. A complete list of tags and attributes will be given below. Attributes must be separated by at least one space.
- `Tag content` %- any text or other nested tags between open and close tags. \\
  - Example: `<center>`Hello world`</center>`. In example `Hello world` is a content of `<center>` tag.
  - Example: `<row>``<cell>`Name:`</cell>``<cell>`John`</cell>``</row>`. In example `<cell>Name:</cell><cell>John</cell>` is a content of `<row>` tag, `Name:` and `John` is a content of relevant `<cell>` tags

## Tags and Attributes
- `<center>` %- sets tag content align to the center. Should have close tag `</center>`. Don't have attributes.
- `<left>` %- sets tag content align to the left. Should have close tag `</left>`. Don't have attributes.
- `<right>` %- sets tag content align to the right. Should have close tag `</right>`. Don't have attributes.
- `<row>` %- defines a content row. Should consist of `<cell>` tags. Don't have attributes.
- `<cell>` %- cell is a nested required tags of `<row>` tag. Has next optional attributes:\\
  - `width` %- size of cell in characters\\
  - `align` %- align of cell content\\
- `<ds>` %- sets double content font size. Should have close tag `</ds>`. Don't have attributes.
- `<qs>` %- sets triple content font size. Should have close tag `</qs>`. Don't have attributes.
- `<fs>` %- sets custom font size. Should have close tag `</fs>`. Has one required attribute `size`. `Size` %- is a number attribute in range from 1 to 9 included.\\
- `<b>` %- sets a `bold` font%-style to content. Should have close tag `</b>`. Don't have attributes.
- `<u>` %- sets a `underline` font%-style to content. Should have close tag `</u>`. Don't have attributes.
- `<i>` %- sets a `italic` font%-style to content. Should have close tag `</i>`. Don't have attributes.
- `<line />` %- print a line of symbols. Selfclosing tag. Has one optional attribute `symbol`. `Symbol` describes which sumbol will be printed in line.
- `<t />` %- sets a tabulation. Selfclosing tag. Don't have attributes.
- `<vt />` %- sets a vertical tabulation. Self closing tag. Don't have attributes.
- `<mb />` %- sets a bottom margin. Self closing tag. Has one required attribute `value`.
- `<ml />` %- sets a left margin. Self closing tag. Has one required attribute `value`.
- `<mr />` %- sets a right margin. Self closing tag. Has one required attribute `value`.
- `<qr />` %- prints QR code. Self closing tag. Has next attributes:
  - `data` %- required. Data that will be coded in QR%-code.
  - `size` %- optional. Size of QR%-code. Number that should be in a range from 0 to 8
- `<bar />` %- prints BAR%-code. Self closing tag. Has next attributes:
  - `data` %- required. Data that will be coded in BAR%-code. Lenght of `data` value depends on selected BAR%-code type.\\
  - `type` %- optional. Type of BAR%-code. Available values:
    - `1` %- selects a `UPC_A` BAR%-code type\\
    - `2` %- selects a `UPC_E` BAR%-code type
    - `3` %- selects a `EAN13` BAR%-code type (default)\\
    - `4` %- selects a `EAN8` BAR%-code type
    - `5` %- selects a `CODE39` BAR%-code type
    - `6` %- selects a `ITF` BAR%-code type
    - `7` %- selects a `NW7` BAR%-code type
    - `8` %- selects a `CODE93` BAR%-code type
    - `9` %- selects a `CODE128` BAR%-code type
  - `hri` %- Selects print position of HRI characters 
    - `0` %- not printed (default)\\
    - `1` %- above the bar code
    - `2` %- below the bar code
    - `3` %- both above and below the bar code\\
  - `width` %- 
  - `height` %- value in range from 1 to 255. Default is 70
  - font %- selects bar code font. Value can be one of:\\
    - `A` (default)\\
    - `B`\\
- `<img />` - prints a bit image. Self closing tag. Has next attributes:
  - src %- required. Base64 source orl to image.\\
  - width %- value in range from 1 to 255. Default is 70
- `<rimg />` - prints a rastr image. Self closing tag. Has next attributes:
  - src %- required. Base64 source orl to image.
  - width %- value in range from 1 to 255. Default is 70
- `<cut />` %- paper full cut
- `<pcut />` %- paper partial cut
- `<br />` %- new line and feed papaer

