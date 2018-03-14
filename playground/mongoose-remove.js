const {mongoose} = require('./../server/db/mongoose-todo.js');
const {Todo} = require('./../server/models/todo.js');
const {ObjectId} = require('mongodb');


Todo.findOneAndRemove({_id: '5aa8dabd25a1e31a20f6138a'}).then((todo) => {
  console.log(todo);
})
