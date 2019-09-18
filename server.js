const express = require("express");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
const fs = require("fs");
const enginde = require("ejs");

const Worker = new TesseractWorker();
const app = express();
const PORT = 5000 || process.env.PORT;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage }).single("avatar");

app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("pages/index.ejs", {
    welcome: "hello world"
  });
});

app.post("/uploads", (req, res) => {
  upload(req, res, err => {
    if (err) return console.log(err);
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log(err);

      Worker.recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress(pro => {
          console.log(pro);
        })
        .then(result => {
          res.render("pages/fileupload.ejs", {
            result: result.text
          });
        })
        .finally(() => Worker.terminate());
    });
  });
});

app.get("/downloads", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

app.listen(PORT, () => {
  console.log(`server is listenig at PORT = ${PORT}`);
});