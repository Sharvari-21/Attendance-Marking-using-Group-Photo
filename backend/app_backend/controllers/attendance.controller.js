import { Attendance } from '../models/AttendanceModel.js';
import { Lecture } from '../models/LectureModel.js';

// Create attendance after face recognition
export const markAttendance = async (req, res) => {
  try {
    const { teacher, classroom, subject, date, presentStudents, imageUrl } = req.body;

    // Validate classroom value
    const allowedClassroomNames = ['D15A', 'D15B', 'D15C'];
    if (!allowedClassroomNames.includes(classroom)) {
      return res.status(400).json({ message: `Invalid classroom. Allowed values: ${allowedClassroomNames.join(', ')}` });
    }

    // // Check if lecture exists for the given date
    // let lecture = await Lecture.findOne({ teacher, classroom, subject, date });

    // // Create a new lecture if it does not exist
    // if (!lecture) {
    //   lecture = new Lecture({ teacher, classroom, subject, date });
    //   await lecture.save();
    // }

    // Create new attendance entry
    const attendance = new Attendance({
      teacher,
      classroom,
      subject,
      date,
      presentStudents,
      imageUrl
    });

    await attendance.save();

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

// Get attendance for a specific lecture
export const getAttendanceByLecture = async (req, res) => {
  try {
    const { classroom, subject, date } = req.query;

    const attendance = await Attendance.findOne({
      classroom,
      subject,
      date: { $gte: new Date(date + 'T00:00:00Z'), $lte: new Date(date + 'T23:59:59Z') }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve attendance' });
  }
};

// Get all attendance records for a student
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const attendanceRecords = await Attendance.find({
      presentStudents: studentId
    });

    res.status(200).json({ total: attendanceRecords.length, records: attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get student attendance' });
  }
};
