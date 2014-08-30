
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
/*
    browserify: {
      game: {
        options:{
          extension: [ '.js' ]
        },
        src: ['<%= paths.game.js %>index.js'],
        dest: '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>'
      }
    },
*/

    concat: {
      all: {
        src: [
            
            '<%= paths.game.js %>reqAnimFrame.js' // polyfill

          , '<%= paths.game.js %>ng/Base.js'

          , '<%= paths.game.js %>ng/Entity.js'
          , '<%= paths.game.js %>ng/Collection.js'

          // Utils

          , '<%= paths.game.js %>ng/util/Mathf.js'
          , '<%= paths.game.js %>ng/util/Color.js'
          , '<%= paths.game.js %>ng/util/Vector.js'
          , '<%= paths.game.js %>ng/util/Renderer.js'

          // Shapes

          , '<%= paths.game.js %>ng/shapes/Circle.js'
          , '<%= paths.game.js %>ng/shapes/Line.js'
          , '<%= paths.game.js %>ng/shapes/Rect.js'
          , '<%= paths.game.js %>ng/shapes/Text.js'

          , '<%= paths.game.js %>ng/Sprite.js'

          // Prefabs

          , '<%= paths.game.js %>prefabs/Controls.js'

          , '<%= paths.game.js %>prefabs/Particles.js'

          , '<%= paths.game.js %>prefabs/Node.js'
          , '<%= paths.game.js %>prefabs/Nodes.js'

          , '<%= paths.game.js %>prefabs/Path.js'
          , '<%= paths.game.js %>prefabs/Paths.js'
          , '<%= paths.game.js %>prefabs/Cursor.js'

          , '<%= paths.game.js %>prefabs/Spider.js'
          , '<%= paths.game.js %>prefabs/Spiders.js'

          , '<%= paths.game.js %>prefabs/Target.js'
          , '<%= paths.game.js %>prefabs/Vacuum.js'
          , '<%= paths.game.js %>prefabs/Stats.js'

          , '<%= paths.game.js %>prefabs/Element.js'
          , '<%= paths.game.js %>prefabs/Elements.js'

          // MAIN

          , '<%= paths.game.js %>sprites.js'
          , '<%= paths.game.js %>Creator.js'
          
          , '<%= paths.game.js %>Modal.js'

          , '<%= paths.game.js %>Manager.js'
          , '<%= paths.game.js %>GameTime.js'
          , '<%= paths.game.js %>Game.js'

          , '<%= paths.game.js %>index.js'

        ],
        dest: '<%= paths.dist.exportJS %><%= paths.dist.gameJS %>',
      },
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
            ,console: true

            ,config: true

            , _ : true
            , $ :true

            ,Time: true
            ,Particles: true
            
            ,game: true

            ,Controls: true
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
  //grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // export
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  //grunt.loadNpmTasks('grunt-contrib-compress');

  var build = [
    "clean", 
    "jshint:all", 
    //"browserify", 
    "concat",
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
    //grunt.task.run(dist);
    grunt.task.run('connect:server');
    return grunt.task.run('watch:all');
  });
  
};
