import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../actions/auth';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error.response ? error.response.data : error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        console.log('File upload response:', response.data);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('File upload error:', error.response ? error.response.data : error);
        alert('File upload failed');
      }
      fetchFiles();  // Refresh the file list after upload
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Redirect to login page
  };

  const handleFileDownload = (fileId) => {

    axios({
      url: `/api/files/download/${fileId}/`,
      method: 'GET',
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }, // Important
    }).then((response) => {
      const fileName = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');

      const reader = new FileReader();
      reader.onload = (e) => {
        const decryptedContent = CryptoJS.AES.decrypt(e.target.result, 'encryption_key').toString(CryptoJS.enc.Utf8);
        const link = document.createElement('a');
        link.href = decryptedContent;
        link.setAttribute('download', fileName); // Use the file name from the file list
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      reader.readAsText(response.data);
    }).catch((error) => {
      console.error('Error downloading file:', error);
    });
  };

  const handleCreateShareLink = (file) => {
    axios.post(`/api/files/share/${file.id}/`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }).then((response) => {
      setShareLink(response.data.share_link);
    }).catch((error) => {
      console.error('Error creating share link:', error);
    });
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
              <button onClick={() => handleFileDownload(file.id)}>Download</button>
              <button onClick={() => handleCreateShareLink(file)}>Create Share Link</button>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileUpload;
