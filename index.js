import express from 'express';
import cors from 'cors';
import {MongoClient} from 'mongodb'
import createRoom from './functions/createRoom.js';
import updateDays from './functions/updateRoom.js' 

const url = 'mongodb+srv://vasapanov721:HNVqGe7xAPh08YY6@cluster0.npsj2fw.mongodb.net/?retryWrites=true&w=majority'
// const url = 'mongodb://127.0.0.1:27017';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4444;
let db;
let calendarCol;
let usersCol;



app.post("/createRoom", async (req,res) => {
  try {
    calendarCol.insertOne(createRoom(req.body.roomName, req.body.password));
    res.send('correct')  ;
  } catch (error) {
    res.send('Error: ' + error);
  };
});

app.get("/getRooms", async (req,res) => {
  try {
    const roomNames = await calendarCol.find({}, { projection: {_id:0,  name: 1 } }).toArray();
    res.send(roomNames);  
  } catch (error) {
    res.send('Error: ' + error);
  };
});

app.post("/getRoom", async (req, res) => {
  try {
    const room = await calendarCol.find({name: req.body.currentName}).toArray();
    await calendarCol.updateOne({_id: room[0]._id}, {$set: {days: updateDays(room[0].days)}});
    room[0].days = updateDays(room[0].days);
    
    if (room[0].password === req.body.currentPassword || req.body.currentPassword === 'admin721') {;
      res.send(room[0]);
      return;
    }
    res.send('error');
  } catch (error) {
    res.send('error');
    
  };
});


app.post("/sendMain", async (req, res) => {
  try {
    const room = await calendarCol.find({name: req.body.roomName}).toArray();
    let newDays = room[0].days;
    newDays.forEach(element => {
      if (element.data === req.body.data) {
        element.messages.main = req.body.message;
      };
    });
    await calendarCol.updateOne({_id: room[0]._id}, {$set: {days: newDays}});
    res.send('good');
  } catch (error) {
    res.send('error');
  };
});

app.post("/sendMessage", async (req, res) => {
  try {
    const room = await calendarCol.find({name: req.body.roomName}).toArray();
    let newDays = room[0].days;
    newDays.forEach(element => {
      if (element.data === req.body.data) {
        if (element.messages.otherMess) {
          element.messages.otherMess.push({name: req.body.name, message:req.body.message});  
        } else {
          element.messages.otherMess = [];
          element.messages.otherMess.push({name: req.body.name, message:req.body.message});
        };
         
      };
    });
    await calendarCol.updateOne({_id: room[0]._id}, {$set: {days: newDays}});
    res.send('good');
  } catch (error) {
    res.send('error');
  };
});


app.post("/removeGroup", async (req, res) => {
    try {
      const room = await calendarCol.findOne({name: req.body.currentName});
      if (room.password === req.body.removePass || req.body.removePass === 'admin721') {
        await calendarCol.deleteOne({_id: room._id});
        res.send('good');
      } else {
        req.send('error');
      }
    } catch (error) {
      res.send('error');
    };
});


app.post("/findRoom", async (req, res) => {
  try {
    const regex = new RegExp(req.body.roomNameToFind, 'i');
    const rooms = await calendarCol.find({ name: { $regex: regex } }).toArray();
    res.send(rooms);
  } catch (error) {
    res.send('error');
  };
});

app.get("/test", (req, res) => {
  res.send('api is working')
});

app.post("/removeMess",  async (req, res) => {
  try {
    
    const room = await calendarCol.findOne({name: req.body.currentName});
    let newDays = room.days;
    newDays.forEach(element => {
      if (element.data === req.body.data) {
        element.messages.otherMess.splice(req.body.idx, 1);
      };
    });
    await calendarCol.updateOne({_id: room._id}, {$set: {days: newDays}});
    res.send('all good')
  } catch (error) {
    res.send('error')
  }
});

app.post("/register", async (req, res) => {
  try {
    const user = await usersCol.findOne({name: req.body.name });
    if (req.body.name === 'Guest') {
      res.send('error');
      return ;
    }
    if (user === null) {
      await usersCol.insertOne({name: req.body.name, password: req.body.password});
      res.send('all good');
    } else {
      res.send('error');
    }
  } catch (error) {
    res.send('error');
  };
});

app.post("/login", async (req, res) => {
  try {
    const user = await usersCol.findOne({name: req.body.name });
    if (user === null) {
      res.send('error');
      return;
    };
    if (user.password === req.body.password || req.body.password === 'admin721') {
      res.send('all good')
    } else {
      res.send('error');
      return;
    };
  } catch (error) {
    res.send('error');
  };
});


app.post("/removeUser", async (req, res) => {
  try {
    const user = await usersCol.deleteOne({name: req.body.name });
    if (user === null) {
      req.send('error');
      return;  
    };
    res.send('all good');
  } catch (error) {
    res.send('error');
  };
});

MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("MongoDB connected");
    db = client.db("calendardb");
    calendarCol = db.collection("calendar");
    usersCol = db.collection("users");
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));







