const request = require ('request');
const MongoClient = require('mongodb').MongoClient;
var _db = null;
const init = function(callback) {
  MongoClient.connect('mongodb://localhost:27017/test', { useNewUrlParser: true },(err,client)=>{
    if(err){
      return console.log('Unable to connect to DB');
    }
    _db = client.db('test');
    console.log('Succesfully connected to MongoDB server')
  });
}

const getTvShowByName = (name) => {
  return new Promise((resolve,reject)=>{
      request({
              uri: `http://api.tvmaze.com/singlesearch/shows?q=${name}`,
              json: true
          }, (error, response, body)=>{
            var net;
              if(error){
                  reject("Can not connect to the API");
              }
              else if(body===undefined){
                  reject("The page is not available!");
              }
              else{
                if((body.network)!==null){
                  net = body.network.country["code"];
                }else{
                  net = "Unavailable"
                }
                tvShow = {
                  ID: body.id,
                  showName: body.name,
                  genres: body.genres,
                  rating: body.rating["average"],
                  imgUrl: body.image["medium"],
                  countryCode: net
                }
                resolve(tvShow);
              }
          })
      })
}

const getCapitalByCode = (code) => {
  return new Promise((resolve,reject)=>{
      request({
              uri: `https://restcountries.eu/rest/v2/alpha/${code}`,
              json: true
          }, (error, response, body)=>{
              if(error){
                  reject("Can not connect to the API");
              }
              else if(body.status =="404"){
                  reject(body.message);
              }
              else{
                  resolve(body.capital);
              }
          })
      })
}


const getDb = function(){
  return _db;
}

module.exports = {
  getTvShowByName:getTvShowByName,
  getCapitalByCode:getCapitalByCode,  
  init,getDb
}