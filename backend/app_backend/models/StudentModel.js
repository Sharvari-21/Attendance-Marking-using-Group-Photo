import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    unique: true, 
    validate: {
      validator: function(v) {
        return /@ves\.ac\.in$/.test(v);
      },
      message: props => `${props.value} is not a valid email format. It must end with @ves.ac.in`
    }
  },
  password: { type: String, required: true },
  rollno:{type:Number}, 
  branch: { type: String },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },

  profileImage: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export const Student = mongoose.model('Student', studentSchema);
