import express from "express";
const app = express();
const port = 80;

// 静的ファイルを提供するディレクトリを指定
app.use(express.static('./public'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
