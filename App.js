const express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
var utils  = require('./utils.js');
var PORT = 8181; // default port 8080
const hbs = require('hbs');
app.use(express.static('views/images')); 
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine','hbs');
const {check, validationResult} = ("express-validator");

app.get('/', (req, res) => {
  res.render('form.hbs');
});

app.get('/searchTvShow',(req, res)=>{
  tempVar = {
    result: ""
  };
  res.render('searchPage.hbs',tempVar);
})

app.get('/updateTvShow/:id',(req, res)=>{
    var db = utils.getDb();
  db.collection('tvShows').findOne({ID: parseInt(req.params.id)}, function(err, document) {
    utils.getCapitalByCode(document.countryCode)
    .then((data => {
      tvShow = {
        ID: document.ID,
        showName: document.showName,
        genres: document.genres,
        rating: document.rating,
        imgUrl: document.imgUrl,
        countryCode: document.countryCode,
        capitalCity: data
      }
      res.render('updatePage.hbs',tvShow);
    }))

  });
})

app.post('/saveTvShowName',(req, res) => {
  var db = utils.getDb();
  utils.getTvShowByName(req.body.showName)
  .then((data=>{
    db.collection('tvShows').findOne({ID: data.ID}, function(err, document) {
      if(document === null){
        db.collection('tvShows').insertOne(data);
        res.redirect(`/tvShows/${data.ID}`);
      }else{
        res.redirect(`/tvShows/${data.ID}`);
      }
    });
  }))
  .catch((error)=>{
    res.render('errorPage.hbs');
  })
});

app.post('/updateTvShow',(req, res) => {
  var db = utils.getDb();
  db.collection('tvShows').findOne({ID: parseInt(req.body.ID)}, function(err, document) {
    utils.getCapitalByCode(document.countryCode)
    .then((data => {
      db.collection('tvShows').updateOne(
        {ID: document.ID},
        { $set: {"capitalCity": data} }
      )
      res.redirect(`/tvShows/${document.ID}`);
    }))
  });
});

app.post('/searchTvShow',(req, res) => {
  var db = utils.getDb();
  db.collection('tvShows').findOne({"showName": req.body.showName, "genres": req.body.genre, "rating": {$gt:parseInt(req.body.rating)}}, function(err, document) {
    if(document === null){
      tempVar = {
        result: "Sorry, The TV show does not exist in DataBase!"
      };
      res.render('searchPage.hbs',tempVar);
    }else{
      tvShow = {
        ID : document.ID,
        showName: document.showName,
        genres: document.genres,
        rating: document.rating,
        imgUrl: document.imgUrl
      }
      res.render('searchPage.hbs',tvShow);
    }
  });
});

app.get('/tvShows/:ID',(req, res) => {
  var db = utils.getDb();
  var dbResult = db.collection('tvShows').find({ ID: parseInt(req.params.ID) });
  dbResult.forEach(element => {
      res.render('showInfo.hbs',element);
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
  utils.init();
});
