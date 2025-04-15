import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import FaceCapture from './components/FaceCapture';
import GroupRecognition from './components/GroupRecognition';
import Results from './components/Results';
import Home from './components/Home';
import TeacherLogin from './components/TeacherLogin';
import TeacherSignUp from './components/TeacherSignup'; 
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    class: '',
    rollNo: '',
    password: ''
  });
  
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    class: '',
    subject: ''
  });
  
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);

  const handleStudentDataSubmit = (data) => {
    setStudentData(data);
    // In a real application, you would save this data to a database
    console.log("Registration data:", data);
  };
  
  const handleTeacherSignup = (data) => {
    setTeacherData(data);
    // In a real application, you would save this data to a database
    console.log("Teacher registration data:", data);
    
    // Set teacher as authenticated after successful registration
    setIsTeacherAuthenticated(true);
    
    return Promise.resolve(true);
  };
  
  const handleTeacherLogin = (loginData) => {
    // In a real application, you would verify credentials against a database
    console.log("Teacher login data:", loginData);
    
    // For demonstration purposes, we'll just set authenticated to true
    setIsTeacherAuthenticated(true);
    
    // For demo, set some mock teacher data
    setTeacherData({
      name: "John Doe",
      email: loginData.email,
      class: "D15A",
      subject: "Computer Science"
    });
    
    return Promise.resolve(true);
  };

  const handleRecognitionComplete = (students) => {
    setRecognizedStudents(students);
  };

  const resetStudentApp = () => {
    setStudentData({
      name: '',
      email: '',
      class: '',
      rollNo: '',
      password: ''
    });
    setRecognizedStudents([]);
  };
  
  const resetTeacherApp = () => {
    setTeacherData({
      name: '',
      email: '',
      class: '',
      subject: ''
    });
    setIsTeacherAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/registration" 
          element={<RegistrationForm onSubmit={handleStudentDataSubmit} navigateTo="/face-capture" />} 
        />
        
        <Route 
          path="/face-capture" 
          element={
            studentData.name ? (
              <FaceCapture studentData={studentData} navigateTo="/student-results" />
            ) : (
              <Navigate to="/registration" replace />
            )
          } 
        />
        
        <Route 
          path="/group-recognition" 
          element={<GroupRecognition onRecognitionComplete={handleRecognitionComplete} navigateTo="/group-results" />} 
        />
        
        <Route 
          path="/student-results" 
          element={
            <Results 
              title="Registration Complete"
              message="Your face data has been successfully registered in the system."
              buttonText="Back to Home"
              navigateTo="/"
              resetApp={resetStudentApp}
            />
          } 
        />
        
        <Route 
          path="/group-results" 
          element={
            <Results 
              title="Recognition Results"
              recognizedStudents={recognizedStudents}
              buttonText="Start New Recognition"
              navigateTo="/group-recognition"
              resetApp={resetStudentApp}
            />
          } 
        />
        
        {/* Teacher Routes */}
        <Route 
          path="/teacher-login" 
          element={<TeacherLogin onLogin={handleTeacherLogin} navigateTo="/teacher-dashboard" />} 
        />
        
        <Route 
          path="/teacher-signup" 
          element={<TeacherSignUp onSignup={handleTeacherSignup}  navigateTo={"/teacher-login"}/>} 
        />
        
        <Route 
          path="/teacher-dashboard" 
          element={
              <TeacherDashboard teacherData={teacherData} onLogout={resetTeacherApp} />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;