// START GENAI
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../actions/auth';
import axios from 'axios';
import { AppBar, Toolbar, Typography, IconButton, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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

      try {
        const response = await axios.post('/api/fileupload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        alert('File uploaded successfully!');
        fetchFiles();  // Refresh the file list after upload
      } catch (error) {
        console.error('File upload error:', error.response ? error.response.data : error);
        alert('File upload failed');
      }
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
      },
    }).then((response) => {
      const fileName = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');

      const reader = new FileReader();
      reader.onload = (e) => {
        const decryptedContent = CryptoJS.AES.decrypt(e.target.result, 'encryption_key').toString(CryptoJS.enc.Utf8);
        const link = document.createElement('a');
        link.href = decryptedContent;
        link.setAttribute('download', fileName);
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
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Secure File Sharing Application
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={2} justifyContent="center" style={{ marginTop: 20 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={10} style={{ padding: 20 }}>
            <form onSubmit={handleFileUpload}>
              <TextField
                type="file"
                fullWidth
                onChange={handleFileChange}
              />
              <Button
                type="submit"
                color="primary"
                variant="contained"
                style={{ marginTop: 10 }}
                fullWidth
              >
                Upload
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={10} style={{ padding: 20, marginTop: 20 }}>
            <Typography variant="h6">Files you have access to:</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell>{new Date(file.upload_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleFileDownload(file.id)}>Download</Button>
                        <Button onClick={() => handleCreateShareLink(file)}>Create Share Link</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default FileUpload;