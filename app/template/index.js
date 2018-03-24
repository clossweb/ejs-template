'use strict';

const ejs = require('ejs');

const main = function () {


    this.init = ()=> {
        this.part = [];
        this.data = [];

        this.totalLastTplData = {};
        this.currentIndex = 0;

        console.log('cleaned');
    }


    this.setData = (data)=> {
        if (typeof(data) === 'object' && !(data instanceof Array)) {
            this.data.push({type: 'part', data: data});
        }

        return this;
    }


    this.page = (...args)=> {
        let datasColl = {};
        let coverkey = args[0];
        let filename = args[1];

        if(args.length === 1){
            filename = args[0];
            coverkey = undefined;
        }

        if (this.data.length) {
            this.data = this.data.filter((value)=> {

                datasColl = Object.assign(datasColl, value.data);

                return value.type == 'setAllAfter';
            });
        }

        this.part.push({
            coverkey,
            filename,
            data: datasColl
        });

        if (coverkey) {
            this.setGblData({_tpl: {key: coverkey}});
        }

        return this;
    }


    this.setGblData = (data) => {
        if (typeof(data) === 'object' && !(data instanceof Array)) {
            this.data.push({type: 'setAllAfter', data: data});
        }

        return this;
    }


    this.getResult = (callback) => {

        const self = this;
        let currentPart = this.part[this.currentIndex];

        if (currentPart.filename) {
            this.totalLastTplData = Object.assign(this.totalLastTplData, (currentPart.data || {})._tpl || {});

            currentPart.data['_tpl'] = this.totalLastTplData; //接續用 template content

            this.renderFile(currentPart.filename, currentPart.data,
                function (err, str) {

                    if (err) {
                        console.error(err);
                        callback(err);
                        self.init();
                    } else {
                        self.currentIndex++;

                        const nextPartIndex = self.currentIndex;

                        if (nextPartIndex < self.part.length) {

                            /* 針對指定_tpl底下變數key轉為內容 */
                            if (self.part[nextPartIndex].data._tpl) {
                                self.part[nextPartIndex].data._tpl[self.part[nextPartIndex].data._tpl.key] = str;
                                delete self.part[nextPartIndex].data._tpl.key;
                            }

                            //self.getResult(callback);
                            process.nextTick(()=> {
                                self.getResult(callback);
                            });
                        } else {
                            callback(null, str);
                            self.init();
                        }
                    }
                });
        }

    }


    this.renderFile = (filename, data, callback) => {
        ejs.renderFile(process.cwd() + '/views/' + filename, data || {}, null, callback);
    }

}


const tpl = new main();
tpl.init();

module.exports = tpl;
