var grunt = require('grunt');

grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-coffee');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-notify');
grunt.loadNpmTasks('grunt-run');

var serverPort = (grunt.option('port') ||
    process.env.PORT ||
    process.env.npm_package_config_port;

grunt.initConfig({
  watch: { // Hwat! This task lays out the dependency graph.
    coffee: {
      files: ['src/**/*'],
      tasks: ['coffee:src'],
      options: {spawn: false}
    },
    templates: {
      files: ['templates/**/*'],
      tasks: ['copy:templates'],
      options: {spawn: false}
    },
    gen: {
      files: ['.tmp/src/**/*'],
      tasks: ['-inline_templates'],
      options: {spawn: false}
    },
    package_json: {
      files: ['package.json'],
      tasks: ['run:inject_version'],
      options: {spawn: false}
    },
    less: {
      files: ['less/**/*'],
      tasks: ['run:lessc'],
      options: {spawn: false}
    },
    build: {
      files: ['build/**/*', 'test/indices/*'],
      tasks: ['bundle'],
      options: {spawn: false}
    }
  },
  coffee: {
    src: {
      expand: true,
      flatten: false,
      cwd: 'src',
      src: ['**/*.coffee'],
      dest: '.tmp/src',
      ext: '.js'
    }
  },
  copy: {
    js: {
      file: [
        {
          expand: true,
          cwd: '.tmp/src/',
          src: ['**'],
          dest: 'build/'
        }
      ]
    },
    templates: {
      files: [
        {
          expand: true,
          cwd: 'templates/',
          src: ['**'],
          dest: '.tmp/src/'
        }
      ]
    }
  },
  run: {
    server: {
      cmd: 'serve',
      args: [
        '--port',
        serverPort
      ]
    },
    lessc: {
      exec: "lessc --include-path=less:node_modules less/main.less > dist/main.css"
    },
    bundle_test_indices: {
      cmd: './bin/bundle-test-indices'
    },
    clean: {
      cmd: './bin/clean'
    },
    inject_version: {
      cmd: './bin/inject-version.js'
    },
    inline_templates: {
      cmd: './bin/inline-templates'
    }
  },
  notify: {
    build: {
      options: {
        title: 'Task Complete',
        message: 'Built test indices'
      }
    },
    less: {
      options: {
        title: 'Task Complete',
        message: 'CSS compiled',
      }
    },
    server: {
      options: {
        message: 'Server is ready!'
      }
    }
  }
});

grunt.registerTask('clean', ['run:clean']);

grunt.registerTask('compile', ['-compile', '-post-compile']);
grunt.registerTask('-compile', ['coffee', 'copy:templates']);
grunt.registerTask('-post-compile', ['run:inject_version', '-inline_templates']);

// Copy src files to the build dir, and inline the templates.
grunt.registerTask('-inline_templates', ['copy:js', 'run:inline_templates']);

grunt.registerTask('bundle', [
  'run:bundle_test_indices'
]);

grunt.registerTask('default', [
  'clean',
  'compile',
  'run:lessc',
  'bundle'
]);