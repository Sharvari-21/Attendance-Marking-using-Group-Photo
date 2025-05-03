# Group Attendance using Face Recognition from Group Photos
**1. Project Overview**
In traditional classroom settings, attendance tracking is often a time-consuming and error-prone process. Manual roll calls can lead to inaccuracies, proxy attendance, and wasted instructional time. This project aims to revolutionize student attendance management by leveraging machine learning to automate the process using a group photo of the class.
The system utilizes advanced facial recognition techniques to detect and identify students present in the image. By eliminating the need for manual roll calls or biometric devices, this system provides a seamless, efficient, and non-intrusive method of attendance tracking.

**2. Tech Stack used**
-Programming Language: Python 3.10
-Deep Learning Frameworks: TensorFlow /Keras, PyTorch
-Libraries & Tools: NumPy, Pandas, DeepFace, OpenCV, Google Vision API, Matplotlib, Scikit-learn
-Model Deployment: Flask (for integrating ML model into web app)
-Database: MongoDB (storing patient data)
-Frontend Technologies: CSS, JavaScript, React.js
-Backend Technologies: Flask (Python-based) and NodeJs

**3. Folder system explaination**
So there are 2 folders namely frontend and backend.There is only a single frontend but for backend there are three folders namely :app_backend , backend_1 and backend_2.
- app_backend is nothing but node js backend that deals with login/signup , creating classrooms and Marking the attendence.
- backend_1 is a version that stores images ( student facial photos) in cloud service named cloudinary.It is memory efficient but time consuming proccess while recognising the stidents in the group photo uploaded by teacher to mark the attendence.
- backend_2 is a version that stores images and embedding in local storage hence it is very fast compared with backend_1 version.
- Also backend_1 is an approach which compares images of individual students with the group photo uploaded by the teacher to mark attendence, While backend_2 creates and stores the embedding from the images of individual student at data collection preocess(student face upload images) and for recognition it compares embeddings instead of comparing the images of individual student with faces extracted in the group photo.

**4. How to run the project ?**
**1.Prerequsites:**
*You will require node (any version) , pthon 3.10 (python 3.10 is need because of tensorflow to work)*
*If you have multiple python installation or a higher version of pyhton you can create a virtual environment using python 3.10 by command :python3.10 -m venv env_name
*
1. Clone the project using command git clone https://github.com/Sharvari-21/Attendance-Marking-using-Group-Photo.git
2. From root Directory go to Attendance-Marking-using-Group-Photo/frontend usind cd command, then run : npm install
3. From root Directory go to Attendance-Marking-using-Group-Photo/backend/app_backend run : npm install
4. Installing necessary python modules:
      pip install flask flask-cors
      pip install opencv-python
      pip install deepface
      pip install numpy
      pip install mtcnn
      pip install scipy
      pip install tensorflow
      pip install keras
5. Go to Attendance-Marking-using-Group-Photo/backend/backend_1/.env and add your environment variables respectively.

**2.Method 1 (frontend + app_backend + backend_1 )**
1. Go to Attendance-Marking-using-Group-Photo/frontend and run the following command to run frontend : npm run dev 
2. Go to Attendance-Marking-using-Group-Photo/backend/app_backend run : node index.js
3. Go to Attendance-Marking-using-Group-Photo/backend/backend_1 run : python app.py
**3.Method 2 (frontend + app_backend + backend_2 )**
1. Go to Attendance-Marking-using-Group-Photo/frontend and run the following command to run frontend : npm run dev 
2. Go to Attendance-Marking-using-Group-Photo/backend/app_backend run : node index.js
3. Go to Attendance-Marking-using-Group-Photo/backend/backend_2 run : python app.py

**Notes:**
- Ensure all dependencies are installed correctly.
- Use backend_1 if cloud storage is required; otherwise, use backend_2 for faster performance.
