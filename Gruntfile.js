
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    paths: {
      game: {
        root: "src/",
        js: "src/js/",
        css: "src/css/game.css",
        images: "src/images/"
      },
      dist: {
        gameJS: "game.js",
        gameCSS: "game.css",
        export: "export/",
        exportJS: "export/js/",
        exportCSS: "export/css/",
        exportImages: "export/images/",
        exportZip: "export/dist.zip"
      }
    },

    clean: {
      before: {
        src: [
          "<%= paths.dist.exportJS %>*",
          "<%= paths.dist.exportCSS %>*",
          "<%= paths.dist.exportImages %>*"
        ],
      } 
    },

    browserify: {
      game: {
        options:{
          extension: [ '.js' ]
        },
        src: ['<%= paths.game.js %>index.js'],
        dest: '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>'
      }
    },

    copy: {
      css: {
        cwd: "./", 
        files: {
          "<%= paths.dist.exportCSS %><%= paths.dist.gameCSS %>": "<%= paths.game.css %>",
        }
      },
      images: {
        expand: true,
        cwd: "<%= paths.game.images %>",
        src: "*.png",
        dest: "<%= paths.dist.exportImages %>"
      }
    },

    jshint: {
      all: {
        files: {
          src: ["<%= paths.game.root %>**/*.js"]
        },
        options: {
          bitwise: true
          ,curly: true
          ,eqeqeq: true
          ,immed: true
          ,latedef: true
          ,newcap: true
          ,noempty: true
          ,nonew: true
          ,undef: true
          ,unused: true
          ,laxcomma: true
          ,quotmark: false
          ,loopfunc: false
          ,forin: false

          ,globals: {
            window: true
            ,document: true
            ,require: true
            ,module: true
            ,console: true
            ,Time: true
            ,game: true
            ,Vector: true
            ,Mathf: true
            ,Renderer: true
            ,config: true
            ,_: true
            
            ,Base: true
            ,Entity: true
            ,Collection: true
            ,Circle: true
            ,Line: true
            ,Sprite: true

            ,Controls: true
            ,Color: true
            ,Repo: true
            ,DEBUG: true
            ,Particles: true
          }
        }

      }
    },

    connect: {
      options: {
        hostname: 'localhost',
        //hostname: '0.0.0.0',
        livereload: 35729,
        port: 3000
      },
      server: {
        options: {
          base: 'export',
          open: true
        }
      }
    },

    watch: {
      options: {
        livereload: '<%= connect.options.livereload %>'
      },
      all: {
        files: ["<%= paths.game.root %>**/*"],
        tasks: ['default']
      }
    },

    // EXPORT TASKS

    uglify: {
      all: {
        options: {
          compress: {
            global_defs: {
              "DEBUG": false
            }
          }
        },
        files: {
          '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>': 
            [ '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>' ]
        }
      }
    },

    cssmin: {
      all: {
        files: {
          "<%= paths.dist.exportCSS %><%= paths.dist.gameCSS %>": 
            ["<%= paths.dist.exportCSS %><%= paths.dist.gameCSS %>"],
        }
      }
    },

    compress: {
      all: {
        options: {
          archive: "<%= paths.dist.exportZip %>"
        },
        expand: true,
        cwd: "<%= paths.dist.export %>",
        src: ['**/*'],
        dest: "<%= paths.dist.export %>"
      }
    }

  });

  // server
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // compile
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // export
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  //grunt.loadNpmTasks('grunt-contrib-compress');

  var build = [
    "clean", 
    "jshint:all", 
    "browserify", 
    "copy"
  ];

  var dist = [
    "uglify", 
    "cssmin"
  ];

  grunt.registerTask("default", build);
  grunt.registerTask("export", build.concat(dist));
  
  return grunt.registerTask('server', function() {
    grunt.task.run(build);
    grunt.task.run('connect:server');
    return grunt.task.run('watch:all');
  });
  
};
