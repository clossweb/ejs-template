const express = require('express');
const router = express.Router();
const page = require('../readyPage');

/**
 * Get root index
 */
router.route('/')
    .get(page.hello);
    // .get((req, res, next)=> {
    //     res.redirect('/hello');
    // });

/**
 * test
 */
router.route('/hello')
    .get(page.hello);
router.route('/hello/a')
    .get(page.hello_a);
router.route('/hello/b')
    .get(page.hello_b);
router.route('/hello/c')
    .get(page.hello_c);


module.exports = router;
