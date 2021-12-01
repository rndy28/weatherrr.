const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "[name].[fullhash].bundle.js",
        asyncChunks: true
    },
    mode: "production", 
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        esModule: false,
                        minimize: true
                    }
                }]
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(woff(2)?|ico|eot|ttf|svg|png|jpe?g|gif)(\?[a-z0-9=\.]+)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "./public/assets"
                    }
                }
            },
        ]
    },
};