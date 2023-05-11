const express = require("express")
const app = express()
const multer = require("multer")
const mysql = require("mysql")
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.get("/", (req, res)=>{
    res.render("home")
})
app.get("/register", (req,res)=>{
    res.render("register")
})
app.get("/login", (req,res)=>{
    res.render("login")
})
app.get("/log-out", (req,res)=>{
    res.render("/")
})
app.get("/raver", (req,res)=>{
    res.render("raver")
})
app.listen(3000, ()=>{
    console.log("Listening on port")
})