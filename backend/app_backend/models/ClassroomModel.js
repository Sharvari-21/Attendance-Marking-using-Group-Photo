import mongoose from 'mongoose';

const allowedClassroomNames = [
  'D15A', 'D15B', 'D15C',
  'D5A', 'D5B', 'D5C',
];

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: allowedClassroomNames
  }
}, { timestamps: true });

export const Classroom = mongoose.model('Classroom', classroomSchema);
export const allowedClassrooms = allowedClassroomNames;
