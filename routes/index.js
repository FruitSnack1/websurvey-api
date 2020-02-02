var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const jsonexport = require('jsonexport');
const url = 'mongodb://127.0.0.1:27017/quiz';
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const rimraf = require('rimraf');
const Path = require('path');
// let name = 'karel';
// let hash = crytpo.createHash('md5').update(name).digest('hex');
// console.log(hash);




router.get('/menu', (req, res) => {
  res.render('menu');
});

router.get('/admin', authenticateToken, (req,res) => {
  console.log(req.user);
  res.render('quiz-index', {user : req.user});
});

router.get('/dashboard', authenticateToken, (req,res) =>{
  res.render('quiz-index', {user : req.user});
});


router.get('/', (req, res) => {
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    console.log('Connection established to', url);
    const db = client.db("quiz");
    const ankety = await db.collection(`hmi_ankety`).find().toArray();
    res.render('select', {
      ankety
    }, (err, html) => {
      if (err) return console.log(err);
      console.log(html);
      res.send(html);
    });
  });
});


router.post('/auth', (req, res) => {
  let name = 'kokot';
  var hash = crypto.createHash('md5').update(name).digest('hex');
});

router.get('/jwt', (req, res) => {
  let privateKey = fs.readFileSync('./private.pem', 'utf8');
  let token = jwt.sign({ "body": "stuff" }, privateKey, { algorithm: 'HS256'});
  res.send(token);
});

function authenticateToken(req, res, next) {

  const token = req.cookies['accessToken'];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.post('/login', (req, res)=>{
  let pass = req.body.pass;
  let hash = crypto.createHash('md5').update(pass).digest('hex');

  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const dbpass = await db.collection('pass').find({'cluster':`${req.body.cluster}`}).toArray();
    console.log(dbpass);

    if(hash == dbpass[0].pass){
      let privateKey = fs.readFileSync('./private.pem', 'utf8');
      let token = jwt.sign({ "body": "stuff" }, privateKey, { algorithm: 'HS256'});
      res.send(token);
    }else{
      res.send('Wrong password');
    }
  });
});

router.get('/home', (req, res) => {
  // if (req.query.pass != passwords[req.query.cluster]) return;
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    console.log('Connection established to', url);
    const db = client.db("quiz");
    const quizzes = await db.collection(`${req.query.cluster}_quizzes`).find().toArray();
    const ankety = await db.collection(`${req.query.cluster}_ankety`).find().toArray();
    const cluster = req.query.cluster;
    res.render('home', {
      quizzes,
      ankety,
      cluster
    }, (err, html) => {
      if (err) return console.log(err);
      console.log(html);
      res.send(html);
    });
  });
});

router.get('/settings', (req, res) => {
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    console.log('Connection established to', url);
    const db = client.db("quiz");
    const quizzes = await db.collection(`${req.query.cluster}_quizzes`).find().toArray();
    const ankety = await db.collection(`${req.query.cluster}_ankety`).aggregate([{$lookup:{from: "hmi_anketa_results", localField:"_id",foreignField:"anketaId",as:"results"}},{$project:{"name":1, "img":1,"date":1,"resultsCount":{$cond:{if:{$isArray:"$results"}, then:{$size:"$results"}, else: 0}}}}]).toArray();
    const cluster = req.query.cluster;
    console.log(ankety);
    res.render('settings', {
      quizzes,
      ankety,
      cluster
    }, (err, html) => {
      if (err) return console.log(err);
      res.send(html);
    });
  });
});

router.get('/createanketa', (req, res) => {
  res.render('createanketa', {
    'anketa': ['a']
  });
});

router.get('/results', (req, res) => {
  console.log(req.query);
  const target = req.query.param;
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const collection = db.collection(`${req.query.cluster}_anketa_results`);
    const result = await collection.find({'anketaId': new mongodb.ObjectId(target)}).toArray();
    console.log(result);
    res.render('results', {result, target}, (err, html) => {
      if (err) return console.log(err);
      res.send(html);
    });
  });
});

router.get('/editanketa', (req, res) => {
  const target = new mongodb.ObjectId(req.query.param);
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const collection = db.collection(`${req.query.cluster}_ankety`);
    const anketa = await collection.find({'_id': target}).toArray();
    console.log(anketa);
    res.render('createanketa', {anketa}, (err, html) => {
      if (err) return console.log(err);
      res.send(html);
    });
  });
});

router.get('/editquiz', (req, res) => {
  let target = req.query.param;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.query.cluster + '_quizzes');
      collection.find({
        'name': target
      }).toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.render('editquiz', {
            'quiz': result
          });
        }
      });
    }
  });
});


router.get('/edit_anketa/:quiz', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection('ankety');
      collection.find({
        'name': req.params.quiz
      }).toArray(function(err, result) {
        if (err) {
          res.send(err);
        } else if (result.length) {
          res.render('edit', {
            "title": req.params.quiz,
            "anketa": result
          });
          console.log(result);
        } else {
          res.send('No documents found');
        }
      });

    }
  });
});

router.post('/edit_quiz', function(req, res) {
  console.log('editing quiz');
  console.log(req.body.originalName);
  let imgJson = JSON.parse(req.body.imgJson);
  console.log('parse succes');
  const tmpDirName = 'tmptmptmptmp';
  const ppath = require('path');
  const rootDir = ppath.join(__dirname, '..');
  fs.renameSync(rootDir + '/public/data/' + req.body.originalName, rootDir + '/public/data/' + tmpDirName);


  let date = new Date();
  let time = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();

  //create object
  var quiz = {
    name: req.body.name,
    img: null,
    desc: req.body.desc,
    count: req.body.count,
    date: time,
    questions: []
  };
  for (var i = 0; i < quiz.count; i++) {
    var o = {};
    o.question = req.body['question' + i];
    o.img = null;
    o.answers = [];
    o.correct_answers = [];
    for (var j = 0; j < req.body['answers-count' + i]; j++) {
      o.answers.push(req.body['a' + i + j]);
      if (req.body['ra' + i + j]) {
        o.correct_answers.push(j);
      }
    }
    quiz.questions.push(o);

  }

  var root = require('app-root-path');
  var path = root.path;
  var dir = './public/data/' + quiz.name;
  fs.mkdirSync(dir);
  // if (!fs.existsSync(dir)){
  //     fs.mkdirSync(dir);
  // }
  var Jimp = require('jimp');
  if (req.files) {
    if (req.files['img']) {
      var file = req.files['img'];
      var filename = file.name;
      filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name);
      console.log('filename = ' + filename);
      quiz.img = "data/" + quiz.name + "/" + filename;
      file.mv(path + "\\public/data/" + quiz.name + "\\" + filename, function(err) {
        if (err) {
          console.log(err);;
        } else {
          // Jimp.read('public/' + quiz.img, (err, file) => {
          //   if (err) throw err;
          //   file
          //     .cover(400, 400)
          //     .write(quiz.img);
          // });
        }
      });
    }

  } else {
    let originalImgs = fs.readdirSync(rootDir + '/public/data/' + tmpDirName);
    // var dir = './public/data/' + req.body.name;
    // fs.mkdirSync(dir);
    let re = new RegExp(req.body.originalName + '.');
    let foundImg = null;
    for (var i = 0; i < originalImgs.length; i++) {
      if (re.exec(originalImgs[i]) != null) {
        foundImg = originalImgs[i];
        break;
      }
    }
    if (foundImg != null) {
      var filename = foundImg;
      filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name);
      quiz.img = "data/" + quiz.name + "/" + filename;
      fs.copyFileSync(rootDir + '/public/data/' + tmpDirName + '/' + foundImg, rootDir + '/public/data/' + quiz.name + '/' + filename);
    } else {
      quiz.img = 'data/default.png';
    }
  }

  for (var i = 0; i < quiz.count; i++) {
    if (req.files) {
      if (req.files['img' + i]) {

        var file = req.files['img' + i];
        var filename = file.name;
        filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name + i);
        quiz.questions[i].img = "data/" + quiz.name + "/" + filename;
        file.mv(path + "\\public/data/" + quiz.name + "\\" + filename, function(err) {
          if (err) {
            throw err;
          } else {
            // Jimp.read('public/data/' + quiz.name + '/' + filename)
            //   .then(function(file) {
            //     file
            //       .cover(400, 400)
            //       .write('public/data/' + quiz.name + '/' + filename);
            //   })
            //   .catch(function(err) {
            //     console.log(err);
            //   });

          }

        });
      }

    } else {
      if (imgJson[i]) {
        let oldSrc = imgJson[i];
        var filename = oldSrc;
        filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name + i);
        quiz.questions[i].img = "data/" + quiz.name + "/" + filename;
        oldSrc = oldSrc.replace(req.body.originalName, tmpDirName);
        fs.copyFileSync(rootDir + '/public/' + oldSrc, rootDir + '/public/data/' + quiz.name + '/' + filename);
      } else {
        quiz.questions[i].img = 'data/default.png';
      }
    }
  }
  console.log(quiz);
  //delete original dir
  var target = req.body.originalName;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      db.collection(req.body.cluster + '_quizzes').deleteOne({
        'name': target
      });
    }
  });
  rimraf('public/data/' + tmpDirName, function() {
    // console.log('folder ' + target + ' deleted');
    // res.status(200).send('Success');
  });
  //
  //size files
  fs.readdir('public/data/' + quiz.name, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      files.forEach(function(file) {
        var path = 'public/data/' + quiz.name + '/' + file;
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
    }

  });
  //adding object to db
  MongoClient.connect(url, function(err, client) {
    if (err) {
      res.send(err);
    } else {
      console.log('Connection established to', url);
      var db = client.db("quiz");
      var collection = db.collection(req.body.cluster + '_quizzes');



      collection.insert([quiz], function(err, result) {
        if (err) {
          console.log(err);
        } else {

          // Redirect to the updated student list
          res.redirect("/settings");
        }

        // Close the database
        client.close();
      });
    }
  });
});
// router.get('/settings', function(req, res) {
//   // res.render('index', {
//   //   title: 'Express'
//   // });
//
//   // Get a Mongo client to work with the Mongo server
//
//   // Define where the MongoDB server is
//
//   // Connect to the server
//   MongoClient.connect(url, function(err, client) {
//     if (err) {
//       console.log('Unable to connect to the Server', err);
//     } else {
//       var db = client.db("quiz");
//       // We are connected
//       console.log('Connection established to', url);
//
//
//       var quizzes;
//       var ankety;
//       db.collection('hmi_quizzes').find().toArray().
//       then(function(data) {
//         quizzes = data;
//         db.collection('hmi_ankety').find().toArray().
//         then(function(data2) {
//           ankety = data2;
//           console.log(quizzes.length);
//           console.log(ankety.length);
//           res.render('settings', {
//
//             // Pass the returned database documents to Jade
//             "quizzes": quizzes,
//             "ankety": ankety
//           });
//         });
//       });
//
//       // Find all students
//
//     }
//   });
// });
router.get('/results/:anketa', function(req, res) {
  let target = req.params.anketa;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection('anketa_results');
      collection.find({
        'name': target
      }).toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.render('results', {
            result: result,
            name: target
          });
        }
      });
    }
  });
});

router.get('/results/:cluster/:type/:target/json', (req, res) => {
  const target = req.params.target;
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const collection = db.collection(`${req.params.cluster}_${req.params.type}_results`);
    const result = await collection.find({'name':target}).toArray();
    res.send(result);
  });
});

router.get('/results/:cluster/:type/:target/csv', (req, res) => {
  const target = req.params.target;
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const collection = db.collection(`${req.params.cluster}_${req.params.type}_results`);
    const result = await collection.find({'name':target}).toArray();
    jsonexport(result, {rowDelimiter:';'}, (err, data) => {
      if(err) return console.log(err);
      res.send(data);
    });
  });
});

router.post('/deleteAnketa', function(req, res) {
    const target = req.body.item;
    MongoClient.connect(url, function(err, client) {
      if (err) console.log('Unable to connect to the Server', err);
      var db = client.db("quiz");
      db.collection(req.body.cluster + '_ankety').deleteOne({
        'name': target
      });
    });
    rimraf('public/data/' + target, function() {
      console.log('folder ' + target + ' deleted');
      res.status(200).send('Success');
    });
});

router.post('/deleteQuiz', function(req, res) {
  if (req.body.pass == passwords[req.body.cluster]) {
    var target = req.body.item;
    MongoClient.connect(url, function(err, client) {
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {
        var db = client.db("quiz");
        db.collection(req.body.cluster + '_quizzes').deleteOne({
          'name': target
        });
      }
    });
    rimraf('public/data/' + target, function() {
      console.log('folder ' + target + ' deleted');
      res.status(200).send('Success');
    });
  }
});

router.get('/delete/:quiz', function(req, res) {
  var target = req.params.quiz;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      db.collection('quizzes').deleteOne({
        'name': target
      });
      db.collection('ankety').deleteOne({
        'name': target
      });
    }
  });
  rimraf('public/data/' + target, function() {
    console.log('folder ' + target + ' deleted');
  });
  res.redirect("/settings");
});

router.get('/createquiz', function(req, res, next) {
  res.render('createquiz', {
    title: 'Nový quiz'
  });
});

router.get('/createanketa', function(req, res, next) {
  res.render('createanketa', {
    title: 'Nová anketa'
  });
});

// router.get('/playQ/:cluster/:quiz', function(req, res) {
//   var MongoClient = mongodb.MongoClient;
//   var url = 'mongodb://127.0.0.1:27017/quiz';
//   MongoClient.connect(url, function(err, client) {
//     if (err) {
//       console.log('Unable to connect to the Server', err);
//     } else {
//       var db = client.db("quiz");
//       var collection = db.collection('quizzes');
//       collection.find({
//         'name': req.params.quiz
//       }).toArray(function(err, result) {
//         if (err) {
//           console.log(err);
//         } else {
//
//           res.render('playQ', {
//             'quiz': result,
//             'cluster' : req.params.cluster
//           })
//
//         }
//       });
//     }
//   });
// });

router.get('/playA/:cluster/:id', function(req, res) {
  let lang = req.headers['accept-language'].substring(0,2);
  if(lang == 'cs') lang = 'cz';
  console.log(lang);
  console.log('bvbbbbbbbbbbbbb');
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.params.cluster + '_ankety');
      collection.find({
        '_id': new mongodb.ObjectId(req.params.id)
      }).toArray(function(err, result) {
        if (err) return console.log(err);
        if(!result[0].languages.includes(lang)){
          lang = 'en';
          if(!result[0].languages.includes(lang))
            lang = 'cs';
        }
        res.render('playA', {
          'anketa': result,
          'cluster': req.params.cluster,
          lang
        })
      });
    }
  });
});

router.get('/playQ/:cluster/:quiz', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.params.cluster + '_quizzes');
      collection.find({
        'name': req.params.quiz
      }).toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {

          res.render('playQ', {
            'quiz': result,
            'cluster': req.params.cluster
          })

        }
      });
    }
  });
});

router.post('/quiz_result', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      res.send(err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.body.cluster + '_quiz_results');

      collection.insert(req.body.result, function(err, result) {
        if (err) {
          console.log(err);
        } else {

          // Redirect to the updated student list
          res.redirect("/");
        }

        // Close the database
        client.close();
      });
    }
  });

});

router.post('/anketa_result', function(req, res) {
  req.body.result.anketaId = new mongodb.ObjectId(req.body.result.anketaId);
  console.log(req.body);
  MongoClient.connect(url, function(err, client) {
    if (err) {
      res.send(err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.body.cluster + '_anketa_results');
      collection.insert(req.body.result, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
        client.close();
      });
    }
  });
});

router.get('/quiz_result', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection('quiz_results');
      collection.find().toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          var o = {
            "r": result
          };
          res.send(o);
        }
      });
    }
  });
});

router.get('/anketa_results/:cluster', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.params.cluster + '_anketa_results');
      collection.find().toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          var o = {
            "r": result
          };
          res.send(o);
        }
      });
    }
  });
});

router.get('/quiz_results/:cluster', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.params.cluster + '_quiz_results');
      collection.find().toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          var o = {
            "r": result
          };
          res.send(o);
        }
      });
    }
  });
});

//adding new quiz
router.post('/addquiz', function(req, res) {
  let date = new Date();
  let time = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();

  //create object
  var quiz = {
    name: req.body.name,
    img: null,
    desc: req.body.desc,
    count: req.body.count,
    date: time,
    questions: []
  };
  for (var i = 0; i < quiz.count; i++) {
    var o = {};
    o.question = req.body['question' + i];
    o.img = null;
    o.answers = [];
    o.correct_answers = [];
    for (var j = 0; j < req.body['answers-count' + i]; j++) {
      o.answers.push(req.body['a' + i + j]);
      if (req.body['ra' + i + j]) {
        o.correct_answers.push(j);
      }
    }
    quiz.questions.push(o);

  }

  var root = require('app-root-path');
  var path = root.path;
  var dir = './public/data/' + quiz.name;
  fs.mkdirSync(dir);
  // if (!fs.existsSync(dir)){
  //     fs.mkdirSync(dir);
  // }
  var Jimp = require('jimp');
  if (req.files['img']) {
    var file = req.files['img'];
    var filename = file.name;
    filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name);
    console.log('filename = ' + filename);
    quiz.img = "data/" + quiz.name + "/" + filename;
    file.mv(path + "\\public/data/" + quiz.name + "\\" + filename, function(err) {
      if (err) {
        console.log(err);;
      } else {
        // Jimp.read('public/' + quiz.img, (err, file) => {
        //   if (err) throw err;
        //   file
        //     .cover(400, 400)
        //     .write(quiz.img);
        // });
      }
    });

  } else {
    quiz.img = 'data/default.png';
  }

  for (var i = 0; i < quiz.count; i++) {
    if (req.files['img' + i]) {
      var file = req.files['img' + i];
      var filename = file.name;
      filename = filename.replace(filename.split('.').slice(0, -1).join('.'), quiz.name + i);
      quiz.questions[i].img = "data/" + quiz.name + "/" + filename;
      file.mv(path + "\\public/data/" + quiz.name + "\\" + filename, function(err) {
        if (err) {
          throw err;
        } else {
          // Jimp.read('public/data/' + quiz.name + '/' + filename)
          //   .then(function(file) {
          //     file
          //       .cover(400, 400)
          //       .write('public/data/' + quiz.name + '/' + filename);
          //   })
          //   .catch(function(err) {
          //     console.log(err);
          //   });

        }

      });

    } else {
      quiz.questions[i].img = "data/default.png";
    }
  }
  //size files
  fs.readdir('public/data/' + quiz.name, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      files.forEach(function(file) {
        var path = 'public/data/' + quiz.name + '/' + file;
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
    }

  });
  //adding object to db
  MongoClient.connect(url, function(err, client) {
    if (err) {
      res.send(err);
    } else {
      console.log('Connection established to', url);
      var db = client.db("quiz");
      var collection = db.collection(req.body.cluster + '_quizzes');



      collection.insert([quiz], function(err, result) {
        if (err) {
          console.log(err);
        } else {

          // Redirect to the updated student list
          res.redirect("/settings");
        }

        // Close the database
        client.close();
      });
    }
  });
});

router.post('/addanketa', function(req, res) {
  console.log(req.body);
  let id = new mongodb.ObjectId();
  let anketa = createAnketaObj(req.body, id);
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
            // Jimp.read('public/data/' + quiz.name + '/' + filename)
            //   .then(function(file) {
            //     file
            //       .cover(400, 400)
            //       .write('public/data/' + quiz.name + '/' + filename);
            //   })
            //   .catch(function(err) {
            //     console.log(err);
            //   });

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
    var collection = db.collection(req.body.cluster + '_ankety');
    collection.insert([anketa], function(err, result) {
      if (err) console.log(err);
      res.status(200).send('Success');
    });
  });
});

router.get('/ajax/:cluster/:name', (req, res) => {
  let target = req.params.name;
  MongoClient.connect(url, function(err, client) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      var db = client.db("quiz");
      var collection = db.collection(req.params.cluster + '_anketa_results');
      collection.find({
        'name': target
      }).toArray(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
      });
    }
  });
});

router.post('/editanketa', (req, res) => {
  let anketa = createAnketaObj(req.body);
  console.log(anketa);
  MongoClient.connect(url, (err, client) => {
    if (err) console.log(err);
    const db = client.db('quiz');
    const collection = db.collection(`${req.body.cluster}_ankety`);
    console.log(`${req.body.cluster}_ankety`);
  })
  res.sendStatus(200);
});

// function createAnketaObj(body, id) {
//   let date = new Date();
//   let time = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
//   //create object
//   var anketa = {
//     _id: id,
//     name: body.name,
//     img: null,
//     count: body.count,
//     desc: body.desc,
//     date: time,
//     questions: [],
//     random_order: false,
//     weights: false,
//     sectors: false,
//     comments: false,
//     user_data: false,
//     languages: ['cz']
//   };
//   for (var i = 0; i < anketa.count; i++) {
//     var o = {};
//     o.question = body['question' + i];
//     o.img = null;
//     anketa.questions.push(o);
//   }
//   if (body.random_order) {
//     anketa.random_order = true;
//   }
//   if (body.note) {
//     anketa.comments = true;
//   }
//   if (body.user_data) {
//     anketa.user_data = true;
//   }
//   if (body.lang_en) {
//     anketa.languages.push('en');
//   }
//   if (body.lang_de) {
//     anketa.languages.push('de');
//   }
//   if (body.weights) {
//     anketa.weights = true;
//   }
//   for (var i = 0; i < anketa.count; i++) {
//     anketa.questions[i].weight = body['weight' + i];
//   }
//   if (body.sectors) {
//     anketa.sectors = true;
//   }
//   anketa.sector_count = body['sector_count'];
//   for (var i = 0; i < anketa.count; i++) {
//     anketa.questions[i].sector = body['sector' + i];
//   }
//   return anketa;
// }

function checkExistingName(target){
  MongoClient.connect(url, function(err, client) {
    if (err) return console.log('Unable to connect to the Server', err);
    var db = client.db("quiz");
    var collection = db.collection(req.params.cluster + '_anketa_results');
    collection.find({
      'name': target
    }).toArray(function(err, result) {
      if (err) return console.log(err);
      res.send(result);
    });
  });
}
module.exports = router;
