import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupRecognition = ({ onRecognitionComplete, navigateTo }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:3000/api/recognize-group', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onRecognitionComplete(data.recognized_students || []);
        navigate(navigateTo);
      } else {
        setError(data.message || 'Recognition failed');
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
    <div className="bg-gradient-to-br from-green-100 via-white to-green-200 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-green-800 mb-4">📷 Group Photo Recognition</h2>
      <p className="text-gray-700 mb-6">
        Upload a group photo to recognize students who have registered in the system.
      </p>

      <div className="mb-6">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        
        <button 
          onClick={triggerFileInput}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:rounded-full transition-all duration-300 hover:bg-green-600 font-medium shadow-sm"
        >
          📤 Select Group Photo
        </button>

        {selectedImage && (
          <div className="mt-4 text-center">
            <p className="text-green-700 font-medium mb-2">Selected: {selectedImage.name}</p>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="mx-auto max-h-64 rounded-lg shadow"
            />
          </div>
        )}
      </div>

      <button 
        onClick={handleUpload}
        disabled={loading || !selectedImage}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:rounded-full transition-all duration-300 hover:bg-blue-600 font-semibold shadow-sm disabled:bg-blue-300 mb-4"
      >
        {loading ? 'Processing...' : '🧠 Recognize Faces'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}

      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-md font-semibold text-gray-800 mb-2">💡 Tips for best results:</h3>
        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
          <li>Use a clear photo with good lighting</li>
          <li>Ensure faces are visible and not too small</li>
          <li>Avoid extreme angles or obscured faces</li>
          <li>Higher resolution images yield better results</li>
        </ul>
      </div>
    </div>
  );
};

export default GroupRecognition;
