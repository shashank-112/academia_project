import React, { useState, useEffect } from 'react';
import { managementService } from '../../../services/api';
import axios from 'axios';

const StudentsDebug = () => {
  const [status, setStatus] = useState('Initializing...');
  const [data, setData] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        // Step 1: Check localStorage token
        const token = localStorage.getItem('access_token');
        console.log('Step 1 - Token in localStorage:', token ? 'YES (length: ' + token.length + ')' : 'NO');
        setStatus('Step 1 - Token check: ' + (token ? 'OK' : 'MISSING'));

        if (!token) {
          setStatus('ERROR: No JWT token in localStorage. You may not be logged in.');
          return;
        }

        // Step 2: Try direct axios call
        console.log('Step 2 - Making direct axios call...');
        const response = await axios.get('http://localhost:8000/api/management/students/', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        console.log('Step 2 - Response:', response.status, response.data);
        setStatus('Step 2 - Direct axios call: SUCCESS');
        setData(response.data);

        // Step 3: Try through managementService
        console.log('Step 3 - Testing managementService...');
        const svcData = await managementService.getAllStudents();
        console.log('Step 3 - Service call result:', svcData);
        setStatus('Step 3 - Service call: SUCCESS');

      } catch (error) {
        console.error('DEBUG ERROR:', error);
        const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message;
        setStatus('ERROR: ' + JSON.stringify({
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: errorMsg,
          fullError: error.message
        }));
      }
    };

    test();
  }, []);

  return (
    <div style={{ padding: '20px',fontFamily: 'monospace', border: '1px solid red' }}>
      <h2>DEBUG: Students API Test</h2>
      <p><strong>Status:</strong> {status}</p>
      {data && (
        <div>
          <p><strong>Data Retrieved:</strong> {data.length} records</p>
          <pre>{JSON.stringify(data.slice(0, 2), null, 2)}</pre>
        </div>
      )}
      <p>
        <a href="/" style={{ color: 'blue' }}>← Back to Dashboard</a>
      </p>
    </div>
  );
};

export default StudentsDebug;
