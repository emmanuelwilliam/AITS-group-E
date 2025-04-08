import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../api/authService';
import '../styles/register.css';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentNumber: '',
    registrationNumber: '',
    webmail: '',
    college: '',
    course: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await registerStudent(formData);
      navigate('/verify', { state: { email: formData.webmail, role: 'student' } });
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Registration failed' });
    }
  };

  // ... keep existing validateForm and handleChange functions ...

  return (
    <div className="register-container">
      {/* ... (keep existing JSX structure) ... */}
    </div>
  );
};

export default StudentRegister;