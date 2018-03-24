var t;
    ;
    (function () {
        if (page === undefined) {
            return;
        }
        var types = [
            ['category', ['add', 'edit', 'delete']],
            ['gettag', [null, null, 'button', 'carousel']],
            ['usetag', ['text', null, 'button', 'carousel']],
            ['schedule', [null]],
            ['manage', ['list', 'add', 'edit']]
        ];
        var currentRow = types[page.type];
        var currentParent = currentRow[0];
        var currentChild = currentRow[1][page.child_type];
        var _ = new main;

        (main.prototype[currentParent] || main.prototype.NA)
                .prototype.parent = //give parent for current main
                _.base.prototype.parent = _; //give parent for BASE

        _.base = _.init.prototype.base = new _.base; //init BASE for itself and INIT prototype

        var mainPage = new (_[currentParent] || _.NA)();

        if (currentChild && mainPage[currentChild]) {
            mainPage[currentChild]();
        }
        t = mainPage;
        /**
         * VE
         */
        var methodPage = mainPage.parent.base.querystring;

        if (page.data) {

            _.VE.prototype.parent = _; //give parent for edit
            _.VE.prototype.parent[currentParent] = mainPage;
            var mainPageEdit = new _.VE(currentParent, currentChild, methodPage.method);

            if (currentChild && mainPageEdit[currentChild]) {
                mainPageEdit[currentChild]();
            }
        }

        console.log('done');
    })();