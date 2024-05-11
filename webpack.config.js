import path from 'path';

export default {
  mode: 'production',
  entry: {
    main: './src/main.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('public/js')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};

