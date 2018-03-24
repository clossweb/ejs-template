'use strict';
const tpl = require('../template');

/**
 * COMMON page block
 * @returns {*|{path, title, template, controller, order, icon}|{x, y}|{x, y, vx, vy, speed}}
 */
const basepage = () => {

    return tpl
        .page('content', 'template/content.tpl.ejs')

        .page('header', 'template/header.tpl.ejs')
        .page('footer', 'template/footer.tpl.ejs')

        .page('index.ejs');
}


/**
 ********************************************************************************** PAGEs
 */

module.exports.hello = (req, res) => {
    tpl
        .setGblData({
            curPage_id: 0,
            title: 'Home'
        })
        .setData({text: 'Home'})
        .page('test', 'template/main/test.tpl.ejs');
    basepage()
        .getResult((err, html) => {
            res.send(html);

            console.log('=>Home ok');
        });
}
module.exports.hello_a = (req, res) => {
    tpl
        .setGblData({
            curPage_id: 1,
            title: 'A'
        })
        .setData({text: 'A'})
        .page('test', 'template/main/test.tpl.ejs');
    basepage()
        .getResult((err, html) => {
            res.send(html);

            console.log('=hello=>a ok');
        });
}
module.exports.hello_b = (req, res) => {
    tpl
        .setGblData({
            curPage_id: 2,
            title: 'B'
        })
        .setData({text: '<b>BB</b>'})
        .page('test', 'template/main/test.tpl.ejs');
    basepage()
        .getResult((err, html) => {
            res.send(html);

            console.log('=hello=>b ok');
        });
}
module.exports.hello_c = (req, res) => {
    tpl
        .setGblData({
            curPage_id: 3,
            title: 'C'
        })
        .setData({text: 'C'})
        .page('test', 'template/main/test.tpl.ejs');
    basepage()
        .getResult((err, html) => {
            res.send(html);

            console.log('=hello=>c ok');
        });
}
