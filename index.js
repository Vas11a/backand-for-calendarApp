import express from 'express';
import cors from 'cors';
import {MongoClient} from 'mongodb'
import createRoom from './functions/createRoom.js';
import updateDays from './functions/updateRoom.js' 

const url = 'mongodb+srv://vasapanov721:HNVqGe7xAPh08YY6@cluster0.npsj2fw.mongodb.net/?retryWrites=true&w=majority'

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4444;
let db;
let calendarCol;



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
  res.send('is working')
})


MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("MongoDB connected");
    db = client.db("calendardb");
    calendarCol = db.collection("calendar");
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));







