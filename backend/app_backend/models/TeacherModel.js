import mongoose from 'mongoose';

const allowedClassroomNames = [
  'D15A', 'D15B', 'D15C',
  'D5A', 'D5B', 'D5C'
];

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subject: { type: String },

  classroom: { 
    type: String, 
    enum: allowedClassroomNames, 
    required: true 
  }

}, { timestamps: true });

export const Teacher = mongoose.model('Teacher', teacherSchema);
