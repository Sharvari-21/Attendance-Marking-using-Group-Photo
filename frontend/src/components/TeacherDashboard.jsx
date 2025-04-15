import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = ({ teacherData, onLogout }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('classes');
  const TeacherData = JSON.parse(localStorage.getItem("teacherData"));
  const TeacherToken = localStorage.getItem("teacherToken");
  const TeacherSubject = localStorage.getItem("teacherSubjects");

  const classes = [
    {
      id: TeacherData._id,
      name: TeacherData.name,
      subject: TeacherSubject,
      color: 'from-green-300 to-green-200',
    },
  ];

  const navigateToGroupRecognition = () => {
    navigate('/group-recognition');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">Teacher Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{teacherData?.name || 'Teacher'}</span>
            <button 
              onClick={onLogout}
              className="text-sm text-gray-600 hover:text-green-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6">
          <div className="flex space-x-6">
            <button 
              onClick={() => setSelectedTab('classes')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition duration-300 ${
                selectedTab === 'classes' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-green-700'
              }`}
            >
              Classes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((classItem) => (
            <div 
              key={classItem.id}
              className="bg-gradient-to-br rounded-xl shadow-lg overflow-hidden from-green-400 to-green-600 transition-shadow hover:shadow-2xl"
            >
              {/* Banner */}
              <div className={`bg-gradient-to-r ${classItem.color} h-28 p-6`}>
                <h2 className="text-white text-xl font-semibold drop-shadow">
                  {classItem.name}: {classItem.subject}
                </h2>
              </div>

              {/* Info Section */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-800">{classItem.name}</p>
                    <p className="text-sm text-gray-500">{classItem.subject}</p>
                  </div>

                  {/* Fancy Button */}
                  <button
                    onClick={navigateToGroupRecognition}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded transition-all duration-300 hover:rounded-full shadow-md"
                  >
                    Take Attendance
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
