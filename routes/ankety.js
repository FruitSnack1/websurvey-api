require('dotenv').config()

var express = require('express');
var router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017/quiz';
const jsonexport = require('jsonexport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const rimraf = require('rimraf');

router.get('/mojeankety', authenticateToken, (req,res) =>{
  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('ankety');
    // let ankety = await collection.find({'userId': new mongodb.ObjectId(req.user.id)}).toArray()
    let ankety = await collection.aggregate([
      {
        '$match': {
          'userId': new mongodb.ObjectId(req.user.id)
        }
      }, {
        '$lookup': {
          'from': 'results',
          'localField': '_id',
          'foreignField': 'anketaId',
          'as': 'results'
        }
      }, {
        '$addFields': {
          'resultsCount': {
            '$size': '$results'
          }
        }
      }, {
        '$project': {
          'results': 0
        }
      }
    ]).toArray();
    ankety = ankety.map( anketa =>{
      const date = new Date(anketa.date);
      let text = '';
      text+= date.getDate() + '.';
      text+= date.getMonth()+1 + '.';
      text+= date.getFullYear();
      anketa.date = text;
      return anketa;
    });
    res.render('quiz-ankety',{ankety});
  });
});

router.get('/create', authenticateToken, (req, res)=>{
  res.render('quiz-create');
});

router.delete('/delete/:id', authenticateToken, (req, res)=>{
  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('ankety');
    await collection.deleteOne({'_id': new mongodb.ObjectId(req.params.id)});
    rimraf(`public/data/${req.params.id}`, async () => {
      const ankety = await collection.find({'userId': new mongodb.ObjectId(req.user.id)}).toArray();
      res.render('quiz-ankety',{ankety});
    });
  });
});

router.post('/create', authenticateToken, (req,res)=>{
  console.log(req.body);
  let id = new mongodb.ObjectId();
  let anketa = createAnketaObj(req.body, id);
  anketa.userId = new mongodb.ObjectId(req.user.id);
  console.log(anketa);
  var root = require('app-root-path');
  var path = root.path;
  if (!fs.existsSync('./public/data')) {
    fs.mkdirSync('./public/data');
  }
  var dir = './public/data/' + id;
  fs.mkdirSync(dir);
  // if (!fs.existsSync(dir)){
  //     fs.mkdirSync(dir);
  // }
  var Jimp = require('jimp');
  if (req.files) {
    if (req.files['img']) {
      var file = req.files['img'];
      var filename = file.name;
      filename = filename.replace(filename.split('.').slice(0, -1).join('.'), id);
      anketa.img = "data/" + id + "/" + filename;
      file.mv(Path.join(path, "/public/data/", id, "/" + filename), function(err) {
        if (err) {
          console.log(err);;
        } else {

        }
      });
    } else {
      anketa.img = 'data/default.png';
    }

  } else {
    anketa.img = 'data/default.png';
  }

  for (var i = 0; i < anketa.count; i++) {
    if (req.files) {
      if (req.files['img' + i]) {
        var file = req.files['img' + i];
        var filename = file.name;
        filename = filename.replace(filename.split('.').slice(0, -1).join('.'), id + i);
        anketa.questions[i].img = "data/" + id + "/" + filename;
        file.mv(Path.join(path, "/public/data/", id, "/" + filename), function(err) {
          if (err) {
            throw err;
          } else {


          }

        });
      } else {
        anketa.questions[i].img = "data/default.png";
      }

    } else {
      anketa.questions[i].img = "data/default.png";
    }
  }
  //size files
  fs.readdir('public/data/' + id, function(err, files) {
    if (err) return console.log(err);
    files.forEach(function(file) {
      var path = 'public/data/' + id + '/' + file;
      console.log('path = ' + path);
      Jimp.read(path)
        .then(function(file) {
          file
            .cover(400, 400)
            .write(path);
        })
        .catch(function(err) {
          console.log(err);
        });
    });


  });
  //adding object to db
  MongoClient.connect(url, function(err, client) {
    if (err) return console.log(err);
    console.log('Connection established to', url);
    var db = client.db("quiz");
    var collection = db.collection('ankety');
    collection.insert([anketa], function(err, result) {
      if (err) console.log(err);
      MongoClient.connect(url, async (err, client) =>{
        if (err) return console.log(err);
        const db = client.db("quiz");
        const collection = db.collection('ankety');
        let ankety = await collection.aggregate([
          {
            '$match': {
              'userId': new mongodb.ObjectId(req.user.id)
            }
          }, {
            '$lookup': {
              'from': 'results',
              'localField': '_id',
              'foreignField': 'anketaId',
              'as': 'results'
            }
          }, {
            '$addFields': {
              'resultsCount': {
                '$size': '$results'
              }
            }
          }, {
            '$project': {
              'results': 0
            }
          }
        ]).toArray();
        ankety = ankety.map( anketa =>{
          const date = new Date(anketa.date);
          let text = '';
          text+= date.getDate() + '.';
          text+= date.getMonth()+1 + '.';
          text+= date.getFullYear();
          anketa.date = text;
          return anketa;
        });
        res.render('quiz-ankety',{ankety});
      });
    });
  });
})

function authenticateToken(req, res, next) {
  const token = req.cookies['accessToken'];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function createAnketaObj(body, id) {
  //create object
  var anketa = {
    _id: id,
    name: body.name,
    img: null,
    description: body.description,
    date: Date.now(),
    questions: [],
    answers: [],
    random_order: false,
    weights: false,
    sectors: false,
    comments: false,
    user_data: false,
    languages: ['cz']
  };
  for (var i = 1; i < 6; i++) {
    anketa.answers.push(body[`answer${i}`]);
  }
  for (var i = 0; i < 50; i++) {
    if(body['question'+i] == '')
      break
    var o = {};
    o.question = body['question' + i];
    o.img = null;
    anketa.questions.push(o);
  }
  if (body.random_order) {
    anketa.random_order = true;
  }
  if (body.note) {
    anketa.comments = true;
  }
  if (body.user_data) {
    anketa.user_data = true;
  }
  if (body.lang_en) {
    anketa.languages.push('en');
  }
  if (body.lang_de) {
    anketa.languages.push('de');
  }
  if (body.weights) {
    anketa.weights = true;
  }
  for (var i = 0; i < anketa.count; i++) {
    anketa.questions[i].weight = body['weight' + i];
  }
  if (body.sectors) {
    anketa.sectors = true;
  }
  anketa.sector_count = body['sector_count'];
  for (var i = 0; i < anketa.count; i++) {
    anketa.questions[i].sector = body['sector' + i];
  }
  return anketa;
}

module.exports = router;
