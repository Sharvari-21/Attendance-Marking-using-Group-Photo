import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/teachers/login",
        formData
      );
      const { token, teacher, subs } = response.data;

      localStorage.setItem("teacherToken", token);
      localStorage.setItem("teacherData", JSON.stringify(teacher));
      localStorage.setItem("teacherSubjects", JSON.stringify(subs));

      navigate("/teacher-dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrors({ general: message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-50 px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-green-200 via-white to-green-100 p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Teacher Login
        </h2>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-green-300`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:ring-2 focus:ring-green-300`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

            <div className="flex justify-end mt-1">
              <a href="#" className="text-sm text-green-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-all duration-300 hover:rounded-full shadow-md"
          >
            Login
          </button>

          <div className="mt-4 text-center text-gray-700">
            <p>
              Don't have an account?{" "}
              <Link
                to="/teacher-signup"
                className="text-green-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLogin;
