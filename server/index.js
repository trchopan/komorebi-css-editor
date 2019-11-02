const fs = require("fs");
const os = require("os");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const port = 3000;

const komorebiDir = path.join(os.tmpdir(), "komorebi");
if (!fs.existsSync(komorebiDir)) {
  fs.mkdirSync(komorebiDir);
}
const cssFile = path.join(komorebiDir, "user.css");
const imagesDir = path.join(komorebiDir, "imgs");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const html = `
<!DOCTYPE html>
<html lang="en">
<style>
  {{ MY STYLE }}
</style>
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  <p class="sample-class-1">Sample Class 1</p>
  <p class="sample-class-2">Sample Class 2</p>
</body>
</html>
`;

const sampleCss = `
.sample-class-1 {
  color:red;
}
.sample-class-2 {
  font-weight: bold;
}
`;

app = express();
app.use(bodyParser.text());
app.use(fileUpload());
app.use(express.static(imagesDir));

getCss = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(cssFile, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

app.get("/", async (req, res) => {
  console.log("GET /");
  var css = sampleCss;
  try {
    css = await getCss();
  } catch (err) {
    console.error(err);
  }
  var h = html.replace("{{ MY STYLE }}", css);
  res.status(200).send(h);
});
app.get("/css", async (req, res) => {
  console.log("GET /css");
  res.set("Access-Control-Allow-Origin", "*");
  var css = sampleCss;
  try {
    css = await getCss();
  } catch (err) {
    console.error(err);
  }
  res.status(200).send(css);
});
app.post("/css", (req, res) => {
  console.log("POST /css");
  res.set("Access-Control-Allow-Origin", "*");
  fs.writeFile(cssFile, req.body, function(err) {
    if (err) {
      console.log(err);
      res.status(500).send("Internal error");
      return;
    }
    console.log(`${cssFile} was saved!`);
    res.status(200).send("Done");
  });
});
app.post("/upload", (req, res) => {
  console.log("POST /upload");
  res.set("Access-Control-Allow-Origin", "*");
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const promises = Object.entries(req.files).map(([name, file]) => {
    return new Promise((resolve, reject) => {
      const filepath = path.join(imagesDir, name);
      file.mv(filepath, err => {
        if (err) {
          reject(err);
        } else {
          resolve(filepath);
        }
      });
    });
  });
  Promise.all(promises)
    .then(files => {
      files.forEach(file => console.log(`${file} saved`));
      res.status(200).send(`${files.length} file(s) uploaded!`);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Internal error");
    });
});
app.get("/upload", (req, res) => {
  console.log("GET /upload");
  res.set("Access-Control-Allow-Origin", "*");
  fs.readdir(imagesDir, "utf-8", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal error");
      return;
    }
    res
      .status(200)
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ files }));
  });
});
app.post("/clear", (req, res) => {
  console.log("POST /clear");
  res.set("Access-Control-Allow-Origin", "*");
  fs.readdir(imagesDir, "utf-8", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal error");
      return;
    }
    const promises = files.map(
      file =>
        new Promise((resolve, reject) => {
          fs.unlink(path.join(imagesDir, file), err => {
            if (err) {
              reject(err);
            } else {
              resolve(file);
            }
          });
        })
    );
    Promise.all(promises)
      .then(files => {
        files.forEach(file => console.log(`${file} deleted`));
        res.status(200).send(`${files.length} file(s) deleted`);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Internal error");
      });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
