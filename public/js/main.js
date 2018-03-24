var main = function () {

}

/****************************************************************
 * !BASE
 * 必要
 ****************************************************************/

main.prototype.base = function () {
    var self = this;

    var $body = $('body');
    var $form = $body.find('form');

    this.state = {
        forForm: {},
        callbacks: {}
    };
    this.elements = {
        body: $body,
        content: {

        },
        form: {
            main: $form
        },
        button: {

        },
        find: {
            
        },
        tpl: {
            popup: $body.find('#POPUP-tpl')
        },
        popup: function (byOther) {
            return (byOther || $body).children().filter('#POPUP');
        }
    };

    this.querystring = this.parseQuerystring();
    this.supportFindIndex();
    //this.supportCloneObject();
    this.parent.API.prototype.parent = this;
    this.API = new this.parent.API;

    console.log('base ok');
};

/**
 * FOR EXAMPLE
 * [
 *  ['title', 'title value'],
 *  ['count', '123456'],
 *  {
 *     tag: [
 *         [['tagID', 'ID1'], ['typeID', 'type1'], ['content', 'content1']],
 *         [['tagID', 'ID2'], ['typeID', 'type2'], ['content', 'content2']],
 *     ]
 *  }
 * ]
 * @param $parent
 * @param $tpl
 * @param replacesArr
 * @returns {{}|*|{name, stat}|{serve, nunjucks}|{files, tasks}|any}
 * \{%(.|\n)+%\}\(\w+\)
 */
main.prototype.base.prototype.addElementByTPL = function ($tpl, $parent, replacesArr) {
    var html = $tpl.html();
    var htmlCP = html;
    var cpOBJ = {};
    var getPartHtml = {};
    var cpReplaceHtml = '';
    var PE;

    /**
     * 陣列內欲取代key和value以[key,value]方式
     * 若存在物件則該塊為定義變數
     */
    (replacesArr || [])
        .map(function (row) {
            if (row instanceof Object && !(row instanceof Array)) {
                for (var key in row) {
                    cpOBJ[key] = row[key];
                }
                return false;
            }

            return row;
        })
        .map(function (row) {
            if (row.length) {
                if (typeof row[0] === 'string') {
                    PE = new RegExp('\{#' + row[0] + '#\}', 'g');
                }

                htmlCP = htmlCP.replace(PE, row[1]);
                return;
            }
        });


    /**
     * 找尋格式
     * {%
     *  <option value="{#value#}" data-tag_name="{#text#}">{#text#}</option>
     * %}(options)
     */
    (htmlCP.match(/\{%[^%]+%\}\(\w+\)/g) || [])
        .map(function (example) {
            return /^\{%([^%]+)%\}\((\w+)\)$/.exec(example) || [];
        })
        .map(function (CPreplace) {

            cpReplaceHtml = (cpOBJ[CPreplace[2]] || [])
                .map(function (_rowElement) {
                    var innerHtml = CPreplace[1];

                    _rowElement.map(function (_rowVar) {

                        if (typeof _rowVar[0] === 'string') {
                            /**
                             * {#test#} 找尋格式
                             * @type {RegExp}
                             */
                            PE = new RegExp('\{#' + _rowVar[0] + '#\}', 'g');
                        }
                        innerHtml = innerHtml.replace(PE, _rowVar[1]);
                    });

                    return innerHtml;

                }).join('\n');


            htmlCP = htmlCP.replace(CPreplace[0], cpReplaceHtml);

            getPartHtml[CPreplace[2]] = cpReplaceHtml;
        });

    if ($parent) {
        $parent.append(htmlCP);
    }

    return getPartHtml;
}

/**
 * FOR EXAMPLE
 * data-field="name" >> {name:<element value>}
 * data-field="value" >> {name:<value>}
 * data-field="action" >> by it was returned true
 */
main.prototype.base.prototype.getDataIntoKeyValueByForm = function (currentElement) {
    var self = this;
    var $currentElement = $(currentElement);
    var value = this.htmlToText($currentElement.val());
    var data_field = $currentElement.attr('data-field');
    var data_value = this.htmlToText($currentElement.attr('data-value'));
    var data_action = $currentElement.attr('data-action');
    var data_group = $currentElement.attr('data-group');
    var splitGroupKeyArr = (data_group || '').split(':');


    if (data_field) {

        if (data_group) {
            if (splitGroupKeyArr.length > 1) {

                var deepLastForData = {};

                if (data_action) {
                    deepLastForData[data_field] =
                        (function (str) {
                            return eval(str);
                        }).apply(currentElement, [data_action]);
                } else {
                    deepLastForData[data_field] = data_value || value;
                }

                var deepGroup = {
                    group: this.state.forForm['group'] || {},
                    result: deepLastForData,
                    stopDeep: false
                };
                deepGroup['current'] = self.cloneObject(deepGroup.group);

                splitGroupKeyArr
                    .map(function (keyName, index, arr) {
                        if (deepGroup.stopDeep) {
                            return [keyName, false];
                        }
                        var deepGroupCurrent = deepGroup.current;

                        if (deepGroup.current.hasOwnProperty(keyName)) {

                            if (deepGroup.current[keyName] instanceof Object && !(deepGroup.current[keyName] instanceof Array)) {
                                deepGroup.current = deepGroup.current[keyName];
                            } else {
                                return [keyName, false];
                            }
                        } else {

                            deepGroup.stopDeep = true;
                            return [keyName, false];
                        }

                        return [keyName, deepGroupCurrent]; //get keyname and current object
                    })
                    .map(function (keyArr, index, arr) {

                        var __index = arr.length - index - 1;
                        var __keyName = arr[__index][0];
                        var __deepGroup = arr[__index][1];
                        var temp = {};

                        if (__deepGroup) {
                            var existKeys = Object.keys(deepGroup.result);
                            temp[__keyName] = deepGroup.result;

                            for (var otherKey in __deepGroup[__keyName]) { //add current object not include exists key
                                if (existKeys.indexOf(otherKey) < 0) {
                                    temp[__keyName][otherKey] = __deepGroup[__keyName][otherKey];
                                }
                            }
                        } else { //for create object
                            temp[__keyName] = deepGroup.result;
                        }

                        deepGroup.result = temp;
                    });

                for (var resultKey in deepGroup.result) {
                    this.state.forForm['group'][resultKey] = deepGroup.result[resultKey];
                }


            } else {
                this.state.forForm['group'][data_group] = this.state.forForm['group'][data_group] || {};

                if (data_action) {

                    this.state.forForm['group'][data_group][data_field] =
                        (function (str) {
                            return eval(str);
                        }).apply(currentElement, [data_action]);
                } else {

                    this.state.forForm['group'][data_group][data_field] = data_value || value;
                }
            }


        } else if (data_action) {

            this.state.forForm[data_field] =
                (function (str) {
                    return eval(str);
                }).apply(currentElement, [data_action]);

        } else {

            this.state.forForm[data_field] = data_value || value;
        }

    }
}

/**
 *
 */
main.prototype.base.prototype.parseTime = function (time, dateOnly) {

    var date = new Date(time);

    if (dateOnly) {
        return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()).replace(/\b(\d)\b/g, '0$1');
    }

    return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
    date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds())
        .replace(/\b(\d)\b/g, '0$1');
}

/**
 * time value to be string for text or input
 */
main.prototype.base.prototype.timeValueToString = function (dateOnly) {
    var self = this;

    $('.time:not(input)').toArray()
        .map(function (row) {
            var $row = $(row);
            var time = parseInt($row.attr('data-time'));
            if (time > 0) {
                $row.text((function (timeStr) {

                    if (dateOnly) {
                        return timeStr;
                    }
                    var timeSplit = timeStr.split(' ');
                    var hmsSplit = timeSplit[1].split(':');

                    var h = parseInt(hmsSplit[0]);
                    var m = parseInt(hmsSplit[1]);
                    //var s = parseInt(hmsSplit[2]);

                    /**
                     * 下午
                     */
                    if (h >= 12) {
                        h = (h - 12) || 12;

                        h = h.toString();
                        m = m.toString().replace(/\b(\d)\b/, '0$1');


                        return timeSplit[0] + ' 下午' + h + ':' + m;// + ':' + s;
                    }
                    /**
                     * 上午
                     */
                    h = h || 12;

                    h = h.toString();
                    m = m.toString().replace(/\b(\d)\b/, '0$1');

                    return timeSplit[0] + ' 上午' + h + ':' + m;// + ':' + s;
                })(self.parseTime(time, dateOnly).replace(/-/g, '/')));
            }
        });

    $('input.time[type="date"]').toArray()
        .map(function (row) {
            var $row = $(row);
            var time = parseInt($row.attr('data-time'));
            if (time > 0) {
                $row.val(self.parseTime(time, true));
            }
        });
}

/**
 * date string and hour, minute, second parse to
 */
main.prototype.base.prototype.parseStringToDate = function (date, hour, minute, second) {
    return new Date(
        (date + ' ' + hour + ':' + minute + ':' + second)
            .replace('-', '/'));
}

/**
 * support HTML5 date
 */
main.prototype.base.prototype.supportHtml5Format = function ($el, op) {

    var dateElement = $el || $('[type="date"]');
    var ruleOP = {
        dateFormat: 'yy-mm-dd'
    };

    for (var key in op) {
        ruleOP[key] = op[key];
    }

    if (dateElement.prop('type') != 'date') {
        ruleOP["dateFormat"] = 'yy/mm/dd';
    }

    dateElement.datepicker(ruleOP);
    dateElement.css({
        'position': 'relative',
        'z-index': '99'
    });

    dateElement
        .toArray()
        .map(function (row) {
            row.onclick = function (event) {
                event.preventDefault();
            }
        });
}

/**
 * support findIndex of array of function when findInde not support
 */
main.prototype.base.prototype.supportFindIndex = function () {

    if (Array.prototype.findIndex) {
        return;
    }

    Array.prototype.findIndex = function (callback) {
        return this.map(callback).indexOf(true);
    }
}

/**
 * support clone object
 */
main.prototype.base.prototype.cloneObject = function (OBJ) {
    //Object.prototype.clone = function () {
    if (OBJ instanceof Object && !(OBJ instanceof Array)) {
        var cp = OBJ.constructor();

        for (var key in OBJ) {
            if (OBJ.hasOwnProperty(key)) {
                cp[key] = this.cloneObject(OBJ[key]);
            }
        }
        return cp;
    }

    return OBJ;
    //}
}


/**
 * getMaxOfArray by Math.max
 */
main.prototype.base.prototype.getMaxOfArray = function (numArray) {
    return Math.max.apply(null, numArray);
}

/**
 * parse QueryString
 */
main.prototype.base.prototype.parseQuerystring = function () {
    var resultJSON = {};
    var keyValArr = [];

    (location.search.match(/([^=&?]+)=([^=&]+)/g) || [])
        .map(function (row) {
            keyValArr = row.split('=');

            if (keyValArr.length) {
                resultJSON[keyValArr[0]] = keyValArr[1];
            }
        });

    return resultJSON;
}

/**
 * parse number to commas
 */
main.prototype.base.prototype.numberWithCommas = function (_number) {
    return _number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 *
 */
main.prototype.base.prototype.htmlToText = function (text) {
    return $('<div />').text(text).html();
}

/**
 *
 */
main.prototype.base.prototype.POPUP = function (op, callbackOK, callbackClose) {
    var $popup = this.elements.popup();
    $popup.remove();

    this.addElementByTPL(
        this.elements.tpl.popup, //tpl
        this.elements.body,
        [
            ['type', op.type || ''],
            ['title', op.title || ''],
            ['text', op.text || '']
        ]);

    $popup = this.elements.popup()
        .modal({backdrop: false});

    $popup.find('#POPUP-ok').click(function () {
        var result = (callbackOK || function () {

        })();

        if (result === false) {
            return;
        }

        $popup.modal('hide');
    });
    $popup.find('#POPUP-close').click(callbackClose || function () {

        });

    return $popup;
}


/****************************************************************
 * !INIT
 * 初始
 ****************************************************************/

main.prototype.init = function () {

    this.EVENTS = this.EVENTS();
    this.EVENTS.main();


    console.log('=>init ok');
}

main.prototype.init.prototype.EVENTS = function () {
    var self = this;

    return {
        main: function () {
            this.form();
            // this.switch.page();

            window.onerror = function (msg) {
                //TODO:error catch
                self.base.POPUP({
                    title: '系統錯誤',
                    text: 'hey, 對不起我已經出錯囉<br><br><p><u>' + msg + '</u></p>麻煩請將訊息回報給我<br>感謝!! 確認後將重新整理',
                    type: 'error'
                }, function () {
                    location.reload();
                });
            }
        },
        form: function () {
            self.submitEvents = { //submit 自訂事件初始化 預設
                on: {
                    active: function () {
                        console.log('ok');
                    },
                    inactive: function () {
                        console.log('invalid');
                    }
                }
            };

            self.base.elements.form.main.validator()
                .on('submit', function (event) { //validator submit送出
                    if (event.isDefaultPrevented()) {
                        // handle the invalid form...
                        self.submitEvents.on.inactive(event);
                    } else {
                        event.preventDefault();
                        // everything looks good!
                        self.submitEvents.on.active(event,
                            function () {
                                $('button[type="submit"]').attr('disabled', '');
                            },
                            function () {
                                $('button[type="submit"]').removeAttr('disabled');
                            });
                    }
                });

            self.base.elements.form.main.on('change', function (event) { //表單變動將儲存狀態
                self.base.getDataIntoKeyValueByForm(event.target);
            });

            /**
             * 為停用所有(動態元素)按鈕本非傳送動作
             */
            $(document).on('click', 'button:not([type="submit"])', function (event) {
                event.preventDefault();
            });
        },
        switch: {
            page: function () {
                
            }
        }
        //here can add other for default
    };
}

main.prototype.init.prototype.submit = function (op, callback) {
    switch (op) {
        case 'ok':
            this.submitEvents.on.active = callback;
            break;

        case 'no':
            this.submitEvents.on.inactive = callback;
            break;

        default :
            this.submitEvents('ok', callback);
            break;
    }
}


/****************************************************************
 * !testA
 * 測試A
 ****************************************************************/

main.prototype.testA = function () {
    this.init = new this.parent.init();

  
    this.formRules = this.formRules();
    this.EVENTS = this.EVENTS();


    console.log('=>testA ok');
}

main.prototype.testA.prototype.EVENTS = function () {
    var self = this;

    return {
        /**
         * 各自subpage EVENTS
         */
        a: {
            submit: {
                ok: function () {
                    self.init.submit('ok', function (e, disableBTN, enableBTN) {

                        var data = self.parent.base.cloneObject(self.parent.base.state.forForm);


                        console.log(data);

                        // self.parent.base.API.testA(data,
                        //     function (ok, data) {
                        //         console.log(data);
                        //         location.href = "/";
                        //     }, function () {
                        //         enableBTN();
                        //         return true; //default alert error
                        //     });

                        disableBTN();
                    });
                }
            }
        }
    };
}

main.prototype.testA.prototype.formRules = function () {
    var self = this;

    return {
        
    };
}

main.prototype.testA.prototype.a = function () { //testA---a page
    var self = this;


    this.EVENTS.a.submit.ok();

    console.log('=test=>button ok');
}


/****************************************************************
 * N/A
 * 未定義頁面
 ****************************************************************/

main.prototype.NA = function () {
    //location.pathname = '/';
    console.log('wrong');
}