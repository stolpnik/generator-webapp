'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

  var prompts = [{
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'Twitter Bootstrap for Sass',
      value: 'compassBootstrap',
      checked: false
    }, {
      name: 'RequireJS',
      value: 'includeRequireJS',
      checked: false
    }, {
      name: 'Autoprefixer for your CSS',
      value: 'autoprefixer',
      checked: false
    }
    ]
  },
  {
	  type: 'input',
	  name: 'baseDir',
	  message: 'input base directory name( should not include start and last “slash“ )',
	  default: ''
  },
  {
	  type: 'input',
	  name: 'jsDir',
	  message: 'input javascript directory name',
	  default: 'js'
  },
  {
	  type: 'input',
	  name: 'cssDir',
	  message: 'input stylesheets directory name',
	  default: 'css'
  },
  {
	  type: 'input',
	  name: 'imagesDir',
	  message: 'input images directory name',
	  default: 'images'
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.compassBootstrap = features.indexOf('compassBootstrap') !== -1;
    this.includeRequireJS = features.indexOf('includeRequireJS') !== -1;
    this.autoprefixer = features.indexOf('autoprefixer') !== -1;
	this.baseDir = answers.baseDir;
	this.jsDir = answers.jsDir;
	this.cssDir = answers.cssDir;
	this.imagesDir = answers.imagesDir;

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.template('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/' + this.baseDir + '/favicon.ico');
  this.copy('404.html', 'app/' + this.baseDir + '/404.html');
  this.copy('robots.txt', 'app/' + this.baseDir + '/robots.txt');
  this.copy('htaccess', 'app/' + this.baseDir + '/.htaccess');
};

AppGenerator.prototype.bootstrapImg = function bootstrapImg() {
  if (this.compassBootstrap) {
    this.copy('glyphicons-halflings.png', 'app/' + this.baseDir + '/' + this.imagesDir +  '/glyphicons-halflings.png');
    this.copy('glyphicons-halflings-white.png', 'app/' + this.baseDir + '/' + this.imagesDir + '/glyphicons-halflings-white.png');
  }
};

AppGenerator.prototype.bootstrapJs = function bootstrapJs() {
  // TODO: create a Bower component for this
  if (this.compassBootstrap) {
    this.copy('bootstrap.js', 'app/' + this.baseDir + '/' + this.jsDir + '/vendor/bootstrap.js');
  }
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassBootstrap) {
    this.copy('main.scss', 'app/' + this.baseDir + '/' + this.cssDir + '/main.scss');
  } else {
    this.copy('main.css', 'app/' + this.baseDir + '/' + this.imagesDir + '/main.css');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate'];
  var contentText = [
    '        <div class="container">',
    '            <div class="hero-unit">',
    '                <h1>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  if (!this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
      this.jsDir + '/bower_components/jquery/jquery.js',
      this.jsDir + '/main.js'
    ]);

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: this.baseDir + '/' + this.jsDir + '/coffee.js',
      sourceFileList: [this.jsDir + '/hello.js'],
      searchPath: '.tmp'
    });
  }

  if (this.compassBootstrap) {
    defaults.push('Twitter Bootstrap');
  }

  if (this.compassBootstrap && !this.includeRequireJS) {
    // wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-affix.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-alert.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-dropdown.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-tooltip.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-modal.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-transition.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-button.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-popover.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-typeahead.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-carousel.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-scrollspy.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-collapse.js',
      this.jsDir + 'bower_components/sass-bootstrap/js/bootstrap-tab.js'
    ]);
  }

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  }

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });

  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    '            </div>',
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));

  this.indexFile = this.indexFile.replace("&lt;%= cssDir %&gt;", this.cssDir);
  this.indexFile = this.indexFile.replace("&lt;%= jsDir %&gt;", this.jsDir);
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (!this.includeRequireJS) {
    return;
  }

  this.indexFile = this.appendScripts(this.indexFile, this.baseDir + '/' + this.jsDir + '/main.js', [this.jsDir + '/bower_components/requirejs/require.js'], {
    'data-main': this.jsDir + '/main'
  });

  // add a basic amd module
  this.write('app/' + this.baseDir + '/' + this.jsDir + '/app.js', [
    '/*global define */',
    'define([], function () {',
    '    \'use strict\';\n',
    '    return \'\\\'Allo \\\'Allo!\';',
    '});'
  ].join('\n'));

  this.template('require_main.js', 'app/' + this.baseDir + '/' + this.jsDir + '/main.js');
};

AppGenerator.prototype.app = function app() {
  var jsDir = 'app/' + this.baseDir + '/' + this.jsDir;
  this.mkdir('app');
  this.mkdir(jsDir);
  this.mkdir('app/' + this.baseDir + '/' + this.cssDir);
  this.mkdir('app/' + this.baseDir + '/' + this.imagesDir);
  this.write('app/' + this.baseDir + '/index.html', this.indexFile);
  this.write( jsDir + '/hello.coffee', this.mainCoffeeFile);
  if (!this.includeRequireJS) {
    this.write(jsDir + '/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
  }
};
