const {mongoose} = require('./../server/db/mongoose-todo.js');
const {Todo} = require('./../server/models/todo.js');
const {ObjectId} = require('mongodb');



var id = '5aa8c22be9b876df105cdecd11';

// if(!ObjectId.isValid(id)){
//   console.log('Id not valid');
// }

/*
Todo.find({
  _id: id
}).then((todos) => {
  console.log('Todos', todos);
});

Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('Todo', todo);
});*/

Todo.findById({
  _id: id
}).then((todo) => {
    if(!todo){
    return  console.log('Id not found');
    }
  console.log('Todo by id', todo);
}).catch((e) => console.log(e));
