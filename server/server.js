// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. CHOOSE YOUR CONNECTION STRING
// Local MongoDB: 'mongodb://127.0.0.1:27017/YOUR_DATABASE_NAME'
// MongoDB Atlas: 'mongodb+srv://...'
const MONGO_URI = 'mongodb://127.0.0.1:27017/school_analytics'; // <--- Change 'school_analytics' to your actual DB name

mongoose.connect(MONGO_URI)
  .then(() => console.log('🎉 MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Inside your backend/server.js
const studentSchema = new mongoose.Schema({
  student_id: String,
  student_name: String,
  department: String,
  course_code: String,
  semester: String,
  grade: Number,    // ⚡ Changed from String to Number
  credits: Number,  // ⚡ Added to match your JSON
  updated_at: Date  // ⚡ Added to match your JSON
});

// 3. FIX THE MODEL NAMES
// Mongoose automatically pluralizes model names. If your collection is named "subjects", 
// pass it explicitly as the THIRD argument so Mongoose doesn't look for "subjects" vs "subjectes".
const Student = mongoose.model('Student', studentSchema, 'subjects'); 

// 4. API Route with detailed error logging
app.get('/api/subjects', async (req, res) => {
  try {
    const data = await Student.find();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching from MongoDB:", error); 
    
    // ⚡ This line will print the EXACT error text directly on your web browser screen
    res.status(500).send(`Database Error: ${error.message}`); 
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});