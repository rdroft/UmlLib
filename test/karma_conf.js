/**
 * Created by roland on 7/27/14.
 */
module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'app/js/*.js',
            'test/unit/*.js'
        ],

        exclude : [],
        autoWatch : true,
        frameworks: ['jasmine'],
        browsers : ['Chrome'],
        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    })}
