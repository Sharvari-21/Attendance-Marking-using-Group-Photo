
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/TeacherModel.js';
import { config } from 'dotenv';

config();

// Signup teacher
export const signupTeacher = async (req, res) => {
  try {
    const { name, email, password, subject, classroom } = req.body;

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({ name, email, password: hashedPassword, subject, classroom });
    await teacher.save();

    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// Login teacher
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const subs=teacher.subject
    const token = jwt.sign({ id: teacher._id }, "akshadmasker", {
      expiresIn: '1d'
    });

    res.status(200).json({ message: 'Login successful', token, teacher,subs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Fetch teacher profile
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select('-password');
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
