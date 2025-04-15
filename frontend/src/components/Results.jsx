import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const Results = ({
  title = "Results",
  message = "",
  recognizedStudents = [],
  buttonText = "Start Over",
  navigateTo = "/",
  resetApp,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (recognizedStudents.length > 0) {
      console.log("Present Students Information:");
      recognizedStudents.forEach((student, index) => {
        console.log(
          `${index + 1}. Name: ${student.name}, Roll No: ${student.roll_no}, Class: ${student.class}`
        );
      });
      console.log("Total students present:", recognizedStudents.length);
    } else {
      console.log("No students were recognized in the group photo.");
    }
  }, [recognizedStudents]);

  const markAttendance = async () => {
    try {
      const teacherData = JSON.parse(localStorage.getItem("teacherData"));
      const teacherToken = localStorage.getItem("teacherToken");
      const teacherSubject = localStorage.getItem("teacherSubjects");

      if (!teacherData || !teacherToken) {
        alert("Teacher data or token missing from localStorage");
        return;
      }

      const payload = {
        teacher: teacherData.name,
        classroom: teacherData.classroom,
        subject: teacherSubject,
        imageUrl: "https://example.com/uploads/class_photo.jpg", // Update with actual image URL
        presentStudents: recognizedStudents.map(
          (student) => `${student.name}-${student.roll_no}`
        ),
      };

      const response = await axios.post(
        "http://localhost:5000/api/attendance/markattendance",
        payload
      );

      console.log("Attendance response:", response.data);
      alert("Attendance marked successfully!");
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert("Error marking attendance. Check console for details.");
    }
  };

  const handleNavigation = () => {
    if (resetApp) resetApp();
    navigate(navigateTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-green-50 to-white px-4 py-10">
      <div className="w-full max-w-2xl bg-gradient-to-br from-green-200 via-white to-green-100 shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{title}</h2>

        {message && (
          <p className="text-gray-600 text-center mb-6">{message}</p>
        )}

        {recognizedStudents.length > 0 ? (
          <>
            <p className="text-gray-700 mb-4 text-lg font-medium">
              The following students were recognized:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              {recognizedStudents.map((student, index) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">{student.name}</span> (Roll No:{" "}
                  {student.roll_no}, Class: {student.class})
                </li>
              ))}
            </ul>
          </>
        ) : (
          recognizedStudents &&
          !message && (
            <p className="mb-6 text-gray-600 text-center">
              No students were recognized in the group photo.
            </p>
          )
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={markAttendance}
            className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded transition-all duration-300 hover:rounded-full shadow-md"
          >
            Mark Attendance
          </button>
          <button
            onClick={handleNavigation}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-2 rounded transition-all duration-300 hover:rounded-full shadow-md"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
