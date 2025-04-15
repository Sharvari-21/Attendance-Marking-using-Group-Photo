import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherSignup = ({ onSignup, navigateTo }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '',
    subject: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const classOptions = ['D15A', 'D15B', 'D15C'];
  const subjectOptions = [
    'Artificial Intelligence and Machine Learning',
    'Computer Networks',
    'Data Structures and Algorithms',
    'Database Management Systems',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.class) {
      newErrors.class = 'Class is required';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setApiError('');
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          classroom: formData.class,
          subject: formData.subject
        };
        const response = await axios.post('http://localhost:5000/api/teachers/signup', payload);
        console.log("Signup successful:", response.data);
        navigate('/teacher-login');
      } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        setApiError(error.response?.data?.message || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-4">
      <div className="w-full max-w-md bg-gradient-to-r from-green-200 via-emerald-100 to-green-300 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Teacher Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
              placeholder="Create a password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="class">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.class ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
            >
              <option value="">Select class</option>
              {classOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="subject">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-400`}
            >
              <option value="">Select subject</option>
              {subjectOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {apiError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:rounded-full transition-all duration-300 hover:bg-green-600"
          >
            Register
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link to="/teacher-login" className="text-green-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default TeacherSignup;
