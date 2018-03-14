const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');


const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectId(),
  text: 'First test todo'
}, {
  _id: new ObjectId(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
})

describe('POST/todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
    .post('/todos')
    .send({text})
    .expect(400)
    .expect((res) =>{
      expect(res.body.text).toBe(text)
    })
    .end((err, res) => {
      if(err) return done(err);

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should not create todo with invalid body data', (done) => {
     request(app)
     .post('/todos')
     .send({})
     .expect(400)
     .end((err, res) => {
         if(err){
           return done(err);
       }
       Todo.find().then((todos) => {
         expect(todos.length).toBe(3);
         done();
       }).catch((e) => done(e));
     })
   });
});

describe('GET/todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done)
  });
});

describe('GET/todos/:id', () => {
  it('should return todo doc', (done) => {
  request(app)
   .get(`/todos/${todos[0]._id.toHexString()}`)
   .expect(200)
   .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text)
   })
   .end(done)
 })
  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectId().toHexString();

      request(app)
       .get(`todos/${hexId}`)
       .expect(404)
       .end(done);
  })

  it('should return 404 if for non-object ids', (done) => {
    request(app)
    .get('/todos/123abc')
    .expect(404)
    .end(done);
  })

});
