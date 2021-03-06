
// Makers logo

IDE_Morph.prototype.createLogo = function () {
    var myself = this;

    if (this.logo) {
        this.logo.destroy();
    }

    this.logo = new Morph();
    this.logo.texture = 'makers/images/fmlogo.png'; // Overriden
    this.logo.drawNew = function () {
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d'),
            gradient = context.createLinearGradient(
                0,
                0,
                this.width(),
                0
            );
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(0.5, myself.frameColor.toString());
        context.fillStyle = MorphicPreferences.isFlat ?
                myself.frameColor.toString() : gradient;
        context.fillRect(0, 0, this.width(), this.height());
        if (this.texture) {
            this.drawTexture(this.texture);
        }
    };

    this.logo.drawCachedTexture = function () {
        var context = this.image.getContext('2d');
        context.drawImage(
            this.cachedTexture,
            5,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    this.logo.mouseClickLeft = function () {
        myself.snapMenu();
    };

    this.logo.color = new Color();
    this.logo.setExtent(new Point(200, 28)); // dimensions are fixed
    this.add(this.logo);
};

/**
 * Override setLanguage function for s4a & makers
 */
IDE_Morph.prototype.setLanguage = function(lang, callback) {
    var myself = this;

    myself.originalSetLanguage(lang, function() {
        myself.setLanguageS4A(lang, function() {
            myself.setLanguageMakers(lang, callback);
        });
    });
};


IDE_Morph.prototype.setLanguageMakers = function (lang, callback) {
    // Load language script for makers related functions
    var makers_translation = document.getElementById('makers-language'),
        makers_src = 'makers/lang/makers-lang-' + lang + '.js',
        myself = this;
    //SnapTranslator.unload();
    if (makers_translation) {
        document.head.removeChild(makers_translation);
    }
    if (lang === 'en') {
        return this.reflectLanguage('en', callback);
    }
    makers_translation = document.createElement('script');
    makers_translation.id = 'makers-language';
    makers_translation.onload = function () {
        myself.reflectLanguage(lang, callback);
    };
    document.head.appendChild(makers_translation);
    makers_translation.src = makers_src;

};

// Modify settings menu to add basic/advanced mode for makers
IDE_Morph.prototype.originalSnap4ArduinoSettingsMenu = IDE_Morph.prototype.settingsMenu;

IDE_Morph.prototype.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    this.originalSnap4ArduinoSettingsMenu();

    menu = world.activeMenu;

    menu.addLine();

    addPreference(
        'Makers basic mode',
        function () {
            world.isMakersBasicMode = !world.isMakersBasicMode; 
            myself.saveSetting('makersBasicMode', world.isMakersBasicMode);
            myself.refreshIDE();
        },
        world.isMakersBasicMode,
        'uncheck to advanced mode (more block options)',
        'check to enable basic mode (reduced blockoptins)'
    );

    addPreference(
        'FirstMakers v1.0 compatible',
        function () {
            world.isMakersV1 = !world.isMakersV1; 
            myself.saveSetting('makersV1', world.isMakersBasicMode);
            myself.refreshIDE();
        },
        world.isMakersV1,
        'uncheck to work with newer versions of the board',
        'check to work with version 1.0 of the board'
    );

    menu.popup(world, pos);
};


IDE_Morph.prototype.originalaSnap4ArduionoApplySavedSettings = 
IDE_Morph.prototype.applySavedSettings;

IDE_Morph.prototype.applySavedSettings = function() {

    this.originalaSnap4ArduionoApplySavedSettings();

    var makersBasicMode = this.getSetting('makersBasicMode'),
    makersV1 = this.getSetting('makersV1');

    // localstorage (and getSetting) gets boolean values as string, so a "false" value is not false.
    // we use the trick JSON.parse(this.getSetting["x"]) to convet "false" into false and "true" into true
    if (typeof makersBasicMode !== "undefined") {
        world.isMakersBasicMode = JSON.parse(makersBasicMode);
    } else {
        world.isMakersBasicMode = true;  //default
    }

    if (typeof makersV1 !== "undefined") {
        world.isMakersV1 = JSON.parse(makersV1);
    } else {
        world.isMakersV1 = false; // default
    }
}



// Modify settings menu to add basic/advanced mode for makers
IDE_Morph.prototype.originalSnap4ArduinoProjectMenu = IDE_Morph.prototype.projectMenu;

IDE_Morph.prototype.projectMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);


    this.originalSnap4ArduinoProjectMenu();

    menu = world.activeMenu;

    menu.addLine();

    menu.addItem(
        'Load examples...',
        function () {
            var fs = require('fs');
            //var startupProject = fs.readFileSync('./init.xml').toString();

            // read a list of libraries from an external file,
            var libMenu = new MenuMorph(this, 'Load example'),
                libUrl = './examples/examples.txt';

            function loadLib(name) {
                var path = './examples/'
                        + name
                        + '.xml';
                myself.droppedText(fs.readFileSync(path).toString(), name);
            }

            //fs.readFileSync('./init.xml').toString()
            //myself.getURL(libUrl).split('\n').forEach(function (line) {
            fs.readFileSync(libUrl).toString().split('\n').forEach(function (line) {
                if (line.length > 0) {
                    libMenu.addItem(
                        line.substring(line.indexOf('\t') + 1),
                        function () {
                            loadLib(
                                line.substring(0, line.indexOf('\t'))
                            );
                        }
                    );
                }
            });

            libMenu.popup(world, pos);
        },
        'Load FirstMakers examples.'
    );

    menu.popup(world, pos);
};


IDE_Morph.prototype.originalSnap4Arduinoinit =  IDE_Morph.prototype.init;

IDE_Morph.prototype.init = function (isAutoFill) {
    this.originalSnap4Arduinoinit(isAutoFill);

    this.currentCategory = 'makers';
}
// Override Snap! menus
IDE_Morph.prototype.snapMenu = function () {
    var menu,
    world = this.world();

    menu = new MenuMorph(this);
    menu.addItem('About FirstMakers...', 'aboutFirstmakers')
    menu.addItem('About Snap4Arduino...', 'aboutSnap4Arduino');
    menu.addLine();

    menu.addItem(
        'First makers website',
        function () {
            window.open('http://www.firstmakers.com', 'fmWebsite');
        }
    );
                
    if (world.isDevMode) {
        menu.addLine();
        menu.addItem(
            'Switch back to user mode',
            'switchToUserMode',
            'disable deep-Morphic\ncontext menus'
            + '\nand show user-friendly ones',
            new Color(0, 100, 0)
        );
    } else if (world.currentKey === 16) { // shift-click
        menu.addLine();
        menu.addItem(
                'Switch to dev mode',
                'switchToDevMode',
                'enable Morphic\ncontext menus\nand inspectors,'
                 + '\nnot user-friendly!',
                new Color(100, 0, 0)
        );
    }
    menu.popup(world, this.logo.bottomLeft());
};

IDE_Morph.prototype.fmWebsite = function(){

};

IDE_Morph.prototype.aboutFirstmakers = function(){
    var dlg, aboutTxt, creditsTxt, translations,
    module, aboutBtn, creditsBtn,
    world = this.world();

    aboutTxt = 'FirstMakers 0.10 \n\n'
    + 'Copyright \u24B8 2015 TIDE S.A.\n'
    //+ 'edutec@citilab.eu\n\n'

    + 'FirstMakers is a modification of Snap4Arduino developed by the\n'
    + 'Edutec research group at the Citilab, Cornellà de Llobregat\n'
    + '(Barcelona).\n\n'

    /*+ 'The Edutec research group is comprised of:\n'
    + 'Víctor Casado\n'
    + 'Jordi Delgado\n'
    + 'Jose García\n'
    + 'Joan Güell\n'
    + 'Bernat Romagosa\n\n'*/

    + 'For more information, please visit\n'
    + 'http://www.firstmakers.com\n'
    //+ 'http://edutec.citilab.eu';

    dlg = new DialogBoxMorph();
    dlg.inform('About Firstmakers', aboutTxt, world);
    dlg.fixLayout();
    dlg.drawNew();
};