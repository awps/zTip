const {resolve} = require('path');
const mix = require('laravel-mix');
const WebpackNotifierPlugin = require('webpack-notifier');
/*
-------------------------------------------------------------------------------
Helpers
-------------------------------------------------------------------------------
*/
const dest = (file) => {
    let destPath = resolve(__dirname, 'dist');
    return `${destPath}/${file}`;
}

const docs = (file) => {
    let destPath = resolve(__dirname, 'docs');
    return `${destPath}/${file}`;
}

/*
-------------------------------------------------------------------------------
Config
-------------------------------------------------------------------------------
*/
mix.sourceMaps(false, 'source-map');

// Overriding default mix notifier
// Will use the "WebpackNotifierPlugin" instead, for more control.
mix.disableNotifications();

/*
-------------------------------------------------------------------------------
Browser sync
-------------------------------------------------------------------------------
*/
mix.browserSync({
    server: {
        baseDir: "docs",
        index: "index.html"
    },
    proxy: false,
    port: 9000,
    open: false,
    injectChanges: true,
    files: '**/*.*'
})

mix.webpackConfig({
    plugins: [
        new WebpackNotifierPlugin({alwaysNotify: true})
    ]
});

/*
-------------------------------------------------------------------------------
Process Javascript
-------------------------------------------------------------------------------
*/
mix.js('src/index.js', dest(`ztip.js`));

/*
-------------------------------------------------------------------------------
Process CSS
-------------------------------------------------------------------------------
*/
mix.less('src/index.less', dest('ztip.css'));

/*
-------------------------------------------------------------------------------
Copy Files
-------------------------------------------------------------------------------
*/
mix.copy('dist/ztip.js', docs('ztip.js'))
mix.copy('dist/ztip.css', docs('ztip.css'))
