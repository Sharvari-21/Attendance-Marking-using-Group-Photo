
import { Classroom } from '../models/ClassroomModel.js';

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort({ name: 1 });
    res.status(200).json(classrooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classrooms' });
  }
};

export const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(200).json(classroom);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving classroom' });
  }
};

export const createClassroom = async (req, res) => {
  return res.status(403).json({ message: 'Classroom creation is disabled. Classrooms are fixed.' });
};

export const updateClassroom = async (req, res) => {
  return res.status(403).json({ message: 'Classroom updates are not allowed' });
};

export const deleteClassroom = async (req, res) => {
  return res.status(403).json({ message: 'Deleting classrooms is not allowed' });
};
