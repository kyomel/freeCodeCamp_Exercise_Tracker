const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const ERR_USER_NOTFUND = {error: 'user not found'};

mongoose.set('useFindAndModify', false);

app.use(cors());
app.use("/public", express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .catch(err => {
    console.error('Cannot connect to mongoDB', err);
  });

const defaultDate = () => new Date().toISOString().slice(0, 10);

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: false },
    exercices: [
      {
        description: { type: String },
        duration: { type: Number },
        date: { type: String, required: false }
      }
    ]
  }
);
const User = mongoose.model('Users', userSchema);

// create and save user (OK)
function addUser(req, res) {const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

  let username = req.body.username;
  if (!username || username.length === 0) {
    res.json({ error: "Invalid username" });
  }
  const user = new User({ username: username });
  user.save(function (err, newUser) {
    if (err) {
      return console.log('addUser() error saving new user:', err);
    }
    res.json({ username: newUser.username, _id: newUser._id });
  });
}

function getAllUsers(req, res) {
  User.find()
    .select('username _id')
    .exec(function (err, userList) {
      if (err) {
        return console.log('getAllUsers() error:', err);
      }
      res.json(userList);
    });
}

function addExercise(req, res) {
  const userId = req.params.userId || req.body.userId; 
  const exObj = { 
    description: req.body.description,
    duration: +req.body.duration,
    date: req.body.date || defaultDate()
  }; 
  User.findByIdAndUpdate(
    userId, 
    {$push: { exercices: exObj } }, 
    function (err, updatedUser) {
      if(err) {
        return console.log('update error:',err);
      }
      let returnObj = {
        username: updatedUser.username,
        description: exObj.description,
        duration: exObj.duration,
       _id: userId,
        date: new Date(exObj.date).toDateString()
      };
      res.json(returnObj);
    }
  );
}


function getLog(req, res) {
  let userId = req.params["_id"];
  let dFrom = req.query.from || '0000-00-00';
  let dTo = req.query.to || '9999-99-99';
  let limit = +req.query.limit || 10000;
  User.findOne({ _id: userId }, function (err, user) {
    if (err) {
      return console.log('getLog() error:', err);
    }
    try {
      let e1 = user.exercices.filter(e => e.date >= dFrom && e.date <= dTo);
      let e2 = e1.map(e => (
          {
            description: e.description, 
            duration: e.duration, 
            date: e.date 
          }
          ));
      let ex = user.exercices.filter(e => e.date >= dFrom && e.date <= dTo)
        .map(e => (
          {
            description: e.description, 
            duration: e.duration, 
            date: e.date 
          }
          ))
        .slice(0,limit);
      let logObj = {};
      logObj.count = ex.length;
      logObj._id = user._id;
      logObj.username = user.username;
      logObj.log = ex;
      res.json(logObj);
    } catch (e) {
      console.log(e);
      res.json(ERR_USER_NOTFUND);
    }
  });
}

app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));
app.post("/api/users", addUser); 
app.post("/api/exercise/new-user", addUser);

app.get ("/api/users", getAllUsers); 
app.get ("/api/exercise/users", getAllUsers); 

app.post("/api/exercise/add", addExercise); 
app.all("/api/users/:userId/exercises", addExercise); 
app.get("/api/exercises/:userId/log", getLog);
app.get("/api/users/:_id/logs", getLog);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})