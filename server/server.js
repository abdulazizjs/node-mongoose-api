require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose-todo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');


var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());


app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.status(400).send(doc);
  },(e) => {
    console.log(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
    if(!ObjectId.isValid(id)){
      console.log('ID is not valid');
    return  res.status(404).send();
    }
    Todo.findByOne({
      _id: id,
      _creator: req.user._id
    }).then((todo) => {
      if(!todo){
        res.status(404).send();
      }
      console.log(todo);
       res.status(200).send({todo});
    }).catch((e) => console.log('ERROR handled'))
})

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
    if(!ObjectId.isValid(id)){
      return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
      if(!todo){
        return res.status(404).send()
      }
      console.log('Removed', todo);
      res.send(todo);
    }).catch((e) => res.status(400).send());

})

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);
  if(!ObjectId.isValid(id)){
    return res.status(404).send();

  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;

  }

   Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
      if(!todo){
        return res.status(404).send();

      }
        res.send({todo});
   }).catch((e) => {
     res.status(400).send();
   })
})

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {

  return  user.generateAuthToken();

  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});


app.get('/users/me',authenticate, (req, res) => {

res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

User.findByCredentials(body.email, body.password).then((user) => {
  return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

module.exports = {app}
