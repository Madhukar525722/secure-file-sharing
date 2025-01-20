import React, { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const FileUpload = () => {
  const [file, setFile] = useState(null);

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
      await axios.post('/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleFileUpload}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;