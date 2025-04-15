import mongoose from 'mongoose';

const allowedClassroomNames = ['D15A', 'D15B', 'D15C'];

const attendanceSchema = new mongoose.Schema({
  teacher: { type: String, required: true },
  classroom: { 
    type: String, 
    enum: allowedClassroomNames, 
    required: true 
  },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true }, // ✅ Auto sets the current date
  imageUrl: { type: String },
  presentStudents: { type: [String], default: [] }
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
