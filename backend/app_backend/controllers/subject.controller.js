// subject.controller.js

import { Subject } from '../models/SubjectModel.js';
import { Classroom } from '../models/ClassroomModel.js';
import { Teacher } from '../models/TeacherModel.js';

// Create a new subject and link to teacher + classroom
export const createSubject = async (req, res) => {
  try {
    const { name, teacherId, classroomId } = req.body;

    const teacher = await Teacher.findById(teacherId);
    const classroom = await Classroom.findById(classroomId);

    if (!teacher || !classroom) {
      return res.status(404).json({ message: 'Teacher or Classroom not found' });
    }

    const newSubject = new Subject({
      name,
      teacher: teacherId,
      classroom: classroomId
    });

    await newSubject.save();
    res.status(201).json({ message: 'Subject created', subject: newSubject });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating subject' });
  }
};

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher').populate('classroom');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

// Get subjects by teacher
export const getSubjectsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const subjects = await Subject.find({ teacher: teacherId }).populate('classroom');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects for teacher' });
  }
};

// Get subjects by classroom
export const getSubjectsByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const subjects = await Subject.find({ classroom: classroomId }).populate('teacher');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects for classroom' });
  }
};

// Update subject (e.g., change teacher or name)
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Subject.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ message: 'Subject updated', subject: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating subject' });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subject' });
  }
};
