// student.controller.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Student } from '../models/StudentModel.js';
import { config } from 'dotenv';

config();

// Signup student
export const signupStudent = async (req, res) => {
  try {
    const { name, email,rollno, password, classroom, profileImage } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email,
      rollno,
      password: hashedPassword,
      classroom,
      profileImage
    });
    await student.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// Login student
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({ message: 'Login successful', token, student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Fetch student profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
