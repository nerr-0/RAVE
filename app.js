const express = require("express");
const app = express();
const multer = require("multer");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/images/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploaded = multer({destination: "/public/images/posters/"})

//creating connection to database
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "rave",
});
con.connect((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("CONNECTED");
  }
});

app.get("/", (req, res) => {
  con.query(" SELECT * FROM posters", (error, allPosts) => {
    if (error) {
      res.render("error");
    } else {
      res.render("home", { posts: allPosts });
    }
  });
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", upload.single("image"), (req, res) => {
  // console.log("route working");
  let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  const filePath =
    req.protocol +
    "://" +
    req.hostname +
    "/images/profiles/" +
    req.file.filename;
  con.query(
    "SELECT email FROM ravers WHERE email = ?",
    [req.body.email],
    (error, results) => {
      if (results.length > 0) {
        res.render("register", { error: "EMAIL ALREADY REGISTERED" });
      } else {
        if (req.body.password === req.body.confirm_password) {
          bcrypt.hash(req.body.password, 5, function (err, hash) {
            con.query(
              "INSERT INTO ravers(name,phone,password,email,image,image_type) VALUES(?,?,?,?,?,?)",
              [
                req.body.name,
                req.body.phone,
                hash,
                req.body.email,
                req.file.filename,
                fileType,
              ],
              (error) => {
                if (error) {
                  res.render("error");
                } else {
                  res.render("login");
                }
              }
            );
          });
        } else {
          res.render("register", { error: "PASSWORDS DO NOT MATCH" });
        }
      }
    }
  );
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  con.query(
    "SELECT * FROM ravers WHERE email = ?",
    [req.body.email],
    (error, results) => {
      console.log(results);
      if (error) {
        res.render("error");
      } else {
        bcrypt.compare(
          req.body.password,
          results[0].password,
          (error, match) => {
            if (error) {
              res.render("error");
            } else {
              if (match) {
                res.render("raver");
              } else {
                res.render("login", { error: "PASSWORDS DO NOT MATCH" });
              }
            }
          }
        );
      }
    }
  );
});
app.get("/log-out", (req, res) => {
  res.render("home");
});
app.get("/raver", (req, res) => {
  res.render("raver");
});
app.get("/account", (req, res) => {
  res.render("account");
});
app.get("/calendar", (req, res) => {
  res.render("calendar");
});
app.get("/info", (req, res) => {
  res.render("info");
});
app.get("/settings", (req, res) => {
  res.render("settings");
});
app.get("/post-add-page", (req, res) => {
  res.render("post-add-page");
});
app.post("/post-add-page", uploaded.single("event_poster"), (req, res) => {
  let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  const filePath =
    req.protocol +
    "://" +
    req.hostname +
    "/images/posters/" +
    req.file.filename;
  con.query(
    "INSERT INTO posters(event_poster, image_type, event_date, event_name) VALUES(?,?,?,?)",
    [req.file.filename, fileType, req.body.event_date, req.body.event_name],
    (error) => {
      if (error) {
        res.render("error");
      } else {
        res.render("raver");
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Listening on port");
});
