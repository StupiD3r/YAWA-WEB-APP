const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. Fixed Database Name
const MONGO_URI = 'mongodb://127.0.0.1:27017/academic_analytics';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🎉 Connected to academic_analytics Database!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Updated Schema Types
const studentSchema = new mongoose.Schema({
  student_id: String,
  student_name: String,
  department: String,
  course_code: String,
  semester: String,
  grade: Number,
  credits: Number,
  updated_at: Date
});

// 3. Fixed Collection Name ('grades')
const Student = mongoose.model('Student', studentSchema, 'grades');

// 4. API Route
app.get('/api/subjects', async (req, res) => {
  try {
    const data = await Student.find();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching from MongoDB:", error);
    res.status(500).json({ message: 'Server Error fetching data', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});