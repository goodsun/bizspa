import express from "express";
import { join, resolve } from 'path';
const app = express();
const port = 80;

app.use(express.static('./public'));

app.get('/*', (req, res) => {
  res.sendFile(resolve('./', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
