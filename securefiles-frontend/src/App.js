import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import MFA from './components/MFA';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fileupload" element={<FileUpload />} />
            <Route path="/mfa" element={<MFA />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
