module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                tsconfig: true,
                options:  { fast: "never" }
            }
        },
        exec: {
            package_dev: {
                command: "npx tfx-cli extension create --manifest-globs vss-extension.json --rev-version --overrides-file configs/dev.json --output-path VSIX_Files",
                stdout: true,
                stderr: true
            },
            package_release: {
                command: "npx tfx-cli extension create --manifest-globs vss-extension.json --rev-version --overrides-file configs/release.json --output-path VSIX_Files",
                stdout: true,
                stderr: true
            }
        },
        copy: {
            scripts: {
                files: [{
                    expand:  true,
                    flatten: true,
                    src:     ["node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js"],
                    dest:    "scripts",
                    filter:  "isFile"
                }]
            }
        },
        clean: ["scripts/**/*.js", "*.vsix"]
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("build",           ["ts:build", "copy:scripts"]);
    grunt.registerTask("package-dev",     ["build", "exec:package_dev"]);
    grunt.registerTask("package-release", ["build", "exec:package_release"]);
    grunt.registerTask("default",         ["package-dev"]);
};
