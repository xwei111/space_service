const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require('axios')
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

app.post("/api/chat", async (req, res) => {
  const { content } = req.body;
  const token = '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'
  const params = {  
    model: 'text-davinci-003',  
    prompt: content,  
    max_tokens: 2000,  
    temperature: 0.5  
  }
  const data = await axios.post('https://api.openai.com/v1/completions', params, {  
    timeout: 300000,  
    headers: { Authorization: `Bearer ${token}` }  
  })
  res.send({
    code: 0,
    data
  });
})

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
