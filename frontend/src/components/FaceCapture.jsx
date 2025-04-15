import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const FaceCapture = ({ navigateTo }) => {
  const location = useLocation();
  const studentData = location.state?.studentData;
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState(Array(5).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!studentData) {
      setError('Missing student information. Please go back and fill the registration form.');
    }
  }, [studentData]);

  const handleImageSelect = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', studentData.name);
    formData.append('roll_no', studentData.rollNo);
    formData.append('class', studentData.class);
    formData.append('imageIndex', currentImage);

    try {
      const response = await fetch('http://localhost:3000/api/upload-face', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const newImages = [...images];
        newImages[currentImage] = URL.createObjectURL(file);
        setImages(newImages);

        setSuccess(`Image ${currentImage + 1} uploaded successfully!`);

        if (currentImage === 4) {
          setTimeout(() => {
            navigate(navigateTo);
          }, 1500);
        } else {
          setTimeout(() => {
            setCurrentImage(currentImage + 1);
            setSuccess('');
          }, 1000);
        }
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (err) {
      setError('Server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-gradient-to-br from-emerald-100 to-teal-200 p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Face Image Capture</h2>
        <p className="text-gray-700 mb-8 text-center text-lg">
          Please upload <strong>5 clear face images</strong>. Good lighting & clarity are key!
        </p>

        {/* Progress Images - Horizontally aligned */}
        <div className="flex justify-between mb-10">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative w-28 h-28 rounded-2xl shadow-md overflow-hidden border-4 flex items-center justify-center transition-all duration-300 ${
                idx < currentImage
                  ? 'border-green-500'
                  : idx === currentImage
                  ? 'border-blue-400 animate-pulse'
                  : 'border-gray-300 bg-gray-100'
              }`}
            >
              {img ? (
                <>
                  <img src={img} alt={`Face ${idx + 1}`} className="object-cover w-full h-full" />
                  <FaCheckCircle className="absolute -top-0.25 -right-0.25 text-green-600 bg-white rounded-full text-xl shadow" />
                </>
              ) : (
                <span className="text-gray-500 text-lg">{idx + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Guidelines */}
        <div className="mb-6 bg-white bg-opacity-40 backdrop-blur-sm p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📸 Image Guidelines:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
            <li>Face must be clearly visible</li>
            <li>Use good lighting conditions</li>
            <li>Only one person in frame</li>
            <li>Look directly at the camera</li>
            <li>Upload with different environments and accessories for better recognition</li>
          </ul>
        </div>

        {/* Upload Section */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        <button
          onClick={triggerFileInput}
          disabled={loading}
          className="w-full bg-white text-teal-700 font-bold py-3 rounded-xl hover:rounded-full transition-all duration-500 shadow hover:shadow-xl hover:bg-green-100 disabled:opacity-60"
        >
          {loading ? 'Uploading...' : `Upload Face Image ${currentImage + 1}`}
        </button>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
