import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 px-4">
      <div className="w-full max-w-xl bg-gradient-to-r from-green-300 to-teal-400 p-10 rounded-3xl shadow-2xl text-white">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome to Face Recognition System</h2>
        <p className="text-lg text-center mb-8">
          Register student faces and perform group face recognition with ease.
        </p>

        <div className="space-y-5 mb-10">
          <Link to="/registration">
            <button className="w-full mb-3 py-3 px-6 bg-white text-green-700 font-semibold rounded-lg hover:rounded-full transition-all duration-300 shadow hover:shadow-lg hover:bg-green-100">
              Register New Student
            </button>
          </Link>

          <Link to="/teacher-login">
            <button className="w-full py-3 px-6 bg-white text-purple-700 font-semibold rounded-lg hover:rounded-full transition-all duration-300 shadow hover:shadow-lg hover:bg-purple-100">
              Login as Teacher
            </button>
          </Link>
        </div>

        <div className="mt-8 p-5 bg-white/90 rounded-xl text-gray-800 shadow-inner">
          <h3 className="text-lg font-semibold mb-3">How it works:</h3>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Student Registration:</strong> Fill student details and capture face images.
            </li>
            <li>
              <strong>Teacher Login:</strong> Teachers can log in to manage classes and view attendance.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
