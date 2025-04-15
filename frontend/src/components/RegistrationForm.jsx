import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = ({ onSubmit, navigateTo }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    class: ''
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll No is required';
    }
    if (!formData.class.trim()) {
      newErrors.class = 'Class is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      navigate(navigateTo, { state: { studentData: formData } });
    }
  };

  const classOptions = ['D15A', 'D15B', 'D15C', 'D5A', 'D5B', 'D5C'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 px-4">
      <div className="w-full max-w-lg bg-gradient-to-r from-green-300 to-teal-400 p-10 rounded-3xl shadow-2xl text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Student Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="rollNo" className="block text-sm font-semibold mb-2">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 ${
                errors.rollNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your roll number"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="class" className="block text-sm font-semibold mb-2">
              Class
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 ${
                errors.class ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your class</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Error Messages Box */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-white/90 rounded-lg p-4 mb-6 text-red-600 text-sm shadow-inner">
              <ul className="list-disc pl-5 space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-green-700 font-bold py-3 rounded-lg hover:rounded-full transition-all duration-300 shadow hover:shadow-lg hover:bg-green-100"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
