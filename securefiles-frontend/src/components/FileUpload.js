//import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../actions/auth';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const FileUpload = () => {
  const [file, setFile] = useState(null);
//  const [files, setFiles] = useState([]);
  const [files] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Define fetchFiles function
  // const fetchFiles = async () => {
  //   const response = await axios.get('/api/user/files', {
  //     headers: {
  //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  //     },
  //   });
  //   setFiles(response.data);
  // };

  // useEffect(() => {
  //   fetchFiles();
  // }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const encryptedContent = CryptoJS.AES.encrypt(e.target.result, 'encryption_key').toString();
      const formData = new FormData();
      formData.append('file_name', file.name);
      formData.append('encrypted_content', encryptedContent);
      const token = localStorage.getItem('authToken');
      console.log('Authorization token:', token); // Log the token

      try {
        const response = await axios.post('/api/fileupload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('File upload response:', response.data);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('File upload error:', error.response ? error.response.data : error);
        alert('File upload failed');
      }
 //     fetchFiles();  // Refresh the file list after upload
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Redirect to login page
  };

  return (
    <div>
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      <button onClick={handleLogout}>Logout</button>

      <h2>Files you have access to:</h2>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Upload Date</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.file_name}</td>
              <td>{new Date(file.upload_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileUpload;
