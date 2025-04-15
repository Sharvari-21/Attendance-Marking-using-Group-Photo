import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true } // e.g., CS101
});

export const Subject = mongoose.model('Subject', subjectSchema);
