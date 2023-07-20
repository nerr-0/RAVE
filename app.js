const express = require("express");
const app = express();
const multer = require("multer");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser")
const PORT = process.env.PORT || 3000;

let isLoggedIn;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/images/posters");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// const uploaded = multer({ destination: "./public/images/posters/" });

//creating connection to database
const con = mysql.createConnection({
  host: "bfhwfzpczhoyqejglhrc-mysql.services.clever-cloud.com",
  user: "ujekqwbizgo9knbz",
  password: "x28dvPkdNRyZ7AWG51KF",
  database: "bfhwfzpczhoyqejglhrc",
});
con.connect((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("CONNECTED TO RAVE DATABASE");
  }
});
// const kon = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "sern",
// });
// kon.connect((error) => {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log("CONNECTED TO SERN DATABASE");
//   }
// });

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  // console.log("route working");
  // let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  // const filePath =
  //   req.protocol +
  //   "://" +
  //   req.hostname +
  //   "/images/profiles/" +
  //   req.file.filename;
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
              "INSERT INTO ravers(name,phone,password,email) VALUES(pat, 034478, 123, pat@gmail.com)",
              (error) => {
                console.log(req.body)
                if (error) {
                  res.render("error", {error});
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
    (error, user) => {
      if (error) {
        res.render("error");
      } else {
        // console.log(user);
        if (user.length > 0) {
          //   console.log(user)
          kon.query("SELECT * FROM posters", (error, allPosts) => {
            if (error) {
              res.render("error");
            } else {
              bcrypt.compare(
                req.body.password,
                user[0].password,
                (error, match) => {
                  if (error) {
                    res.render("error");
                  } else {
                    if (match) {
                      isLoggedIn = true;

                      if (error) {
                        res.render("error");
                      } else {
                        // console.log(allPosts[0])
                        res.render("raver", { allPosts });
                      }
                    } else {
                      isLoggedIn = false;
                      res.render("login", { error: "WRONG PASSWORD" });
                    }
                  }
                }
              );
            }
          }); //the tag will go here
        } else {
          res.render("login", { error: "USER DOES NOT EXIST" });
        }
      }
    }
  );
});
app.get("/contact", (req, res) => {
  res.render("contact");
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
app.post("/account", (req, res) => {
  con.query(
    "SELECT * FROM ravers WHERE email = ?",
    [req.body.email],
    (error, results) => {
      console.log(results[0]);
      if (error) {
        res.render("error");
      } else {
        res.render("account", { currentUser: results[0] });
      }
    }
  );
});
app.get("/ticket", (req, res) => {
  res.render("ticket");
});
app.get("/calendar", (req, res) => {
  kon.query(
    "SELECT * FROM posters",
    (error, results) => {
      console.log(results);
      // console.log(req.body.event_name)
      if (error) {
        res.render("error");
      } else {
        var eventTicket = results[Math.floor(Math.random() * results.length)];
        res.render("calendar", { eventTicket});
      }
    }
  );
});
app.get("/about", (req, res) => {
  res.render("info");
});
app.get("/info", (req, res) => {
  res.render("info");
});
app.get("/settings", (req, res) => {
  if (isLoggedIn === true) {
    res.render("settings");
  } else {
    res.render("login", { error: "PLEASE LOGIN" });
  }
});
app.get("/post-add-page", (req, res) => {
  res.render("post-add-page");
});
app.post("/post-add-page", upload.single("eventposter"), (req, res) => {
  let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  const filePath =
    req.protocol +
    "://" +
    req.hostname +
    "/images/posters/" +
    req.file.filename;
  // console.log(req.file.filename);
  kon.query(
    "INSERT INTO posters(eventposter, image_type, event_date, event_name) VALUES(?,?,?,?)",
    [req.file.filename, fileType, req.body.event_date, req.body.event_name],
    (error) => {
      if (error) {
        res.render("error");
      } else {
        kon.query("SELECT * FROM posters", (error, allPosts) => {
          if (error) {
            res.render("error");
          } else {
            res.render("raver", { allPosts });
          }
        });
        // res.render("raver", { allPosts });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log("LISTENING ON PORT 3000");
});
