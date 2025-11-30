import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { runGAS } from '../lib/api';
import { ErrorBanner } from './ErrorBanner';

export const CustomerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await runGAS('api_createCustomer', formData);
      navigate('/customers');
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h1>Create New Customer</h1>
      <Link to="/customers">← Back to List</Link>

      <div style={{ marginTop: '20px' }}>
        <ErrorBanner message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            >
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                backgroundColor: loading ? '#ccc' : '#646cff',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};