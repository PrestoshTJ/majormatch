const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();

let token = null


// Middleware
app.use(cors());
app.use(express.json());

// Basic test route (outside .then for testing)
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.send('Server is running!');
});

// MongoDB Connection (UserInfo Database)
const userInfoUrl = "mongodb+srv://admin:xEJj4t0sLTd6AXnl@cluster0.ozsdvxf.mongodb.net/UserInfo?retryWrites=true&w=majority&appName=Cluster0";


mongoose.connect(userInfoUrl)
  .then(() => console.log("Connected to UserInfo Database"))
  .catch(err => console.error('Failed to connect to UserInfo Database:', err));

const userinfoSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  College: {type: String, required: false},
  Major: {type: String, required: false},
  Hobbies: {type: String, required: false}
}, { collection: 'Passwords' });

const Users = mongoose.model('Passwords', userinfoSchema);


// Route to add a new user
app.post('/api/Passwords', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await Users.findOne({ Username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already in use.' });
    }

    const newUser = new Users({ Username, Password });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.get('/api/Passwords', async (req, res) => {
  try {
    // Get username from query parameter
    const username = req.query.username;
    
    // Validate the username parameter
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }
    console.log(username);
    if (username === "ALL") {
      const allUsers = await Users.find();
      return res.json(allUsers);
    }
    // Use the correct variable name (username) from the query
    const existingUser = await Users.findOne({ Username: username });
    
    // Check if user exists
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return the required user information using existingUser instead of userData
    res.status(200).json({
      Username: existingUser.Username,
      College: existingUser.College,
      Major: existingUser.Major,
      Hobbies: existingUser.Hobbies
    });
    
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// This function would be implemented to actually fetch the data
async function getUserByUsername(username) {
  // Replace this with your actual database query logic
  // Example with MongoDB and Mongoose:
  // return await UserModel.findOne({ Username: username });
  
  // Placeholder implementation
  // Remove this when you implement actual database access
  return null;
}

app.patch('/api/Passwords', async (req, res) => {
  try {
    // Extract data from the request body
    const { Username, College, Major, Hobbies } = req.body;

    // Find the user by Username (assuming a Mongoose model named 'Users')
    const user = await Users.findOne({ Username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if they are provided in the request
    if (College) user.College = College;
    if (Major) user.Major = Major;
    if (Hobbies) user.Hobbies = Hobbies;

    // Save the updated user to the database
    await user.save();

    // Send a success response with the updated user
    res.status(200).json({ message: 'User updated successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

  
app.post('/api/login', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await Users.findOne({ Username });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    console.log(Password, user.Password);
    const isMatch = Password == user.Password;
    console.log(isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    token = jwt.sign(
      { id: user._id, Username: user.Username },
      'your-secret-key', // Replace with process.env.JWT_SECRET in production
      { expiresIn: '1h' }
    );


    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});



// MongoDB Connection (Chatrooms Database)
const chatroomUrl = "mongodb+srv://admin:xEJj4t0sLTd6AXnl@cluster0.ozsdvxf.mongodb.net/Chatrooms?retryWrites=true&w=majority&appName=Cluster0";
const chatroomConnection = mongoose.createConnection(chatroomUrl);



chatroomConnection.on('connected', () => {
  console.log('Connected to Chatrooms Database');
});

// Route to fetch data from a specific collection in Chatrooms DB
app.get('/api/chatrooms/:collection', async (req, res) => {
  const collectionName = req.params.collection;

  try {
    // Check if the collection exists
    const collection = chatroomConnection.collection(collectionName);

    // Fetch all data from the collection
    const data = await collection.find({}).toArray();
    if (data.length === 0) {
      return res.status(404).json({ message: 'No data found in this collection.' });
    }

    res.json(data);
  } catch (err) {
    console.error(`Error fetching data from collection: ${collectionName}`, err);
    res.status(500).json({ message: 'Error fetching data from collection.', error: err.message });
  }
  
});



app.post('/api/chatrooms/:collection', async (req, res) => {
  try {
    const { Username, Message, Time } = req.body;
    const collectionName = req.params.collection;

    const chatroomsSchema = new mongoose.Schema({
      Username: { type: String, required: true },
      Message: { type: String, required: true },
      Time: { type: Number, required: true }
    });

    const getChatroomModel = (collectionName) => {
      return chatroomConnection.models[collectionName] || chatroomConnection.model(collectionName, chatroomsSchema, collectionName);
    };

    const ChatroomModel = getChatroomModel(collectionName);

    const newMessage = new ChatroomModel({
      Username,
      Message,
      Time
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message added successfully!', data: newMessage });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});




// Server startup
const PORT = process.env.PORT || 3003;
console.log('Starting server on port:', PORT);
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
