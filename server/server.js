const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose-todo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');


var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.status(400).send(doc);
  },(e) => {
    console.log(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
    if(!ObjectId.isValid(id)){
      console.log('ID is not valid');
    return  res.status(404).send();
    }
    Todo.findById({
      _id: id
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

module.exports = {app}
