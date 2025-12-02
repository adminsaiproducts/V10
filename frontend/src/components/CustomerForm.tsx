import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { runGAS } from '../lib/api';
import { ErrorBanner } from './ErrorBanner';

export const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    status: 'lead'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressCandidates, setAddressCandidates] = useState<Array<{ prefecture: string; city: string; address1: string }>>([]);

  useEffect(() => {
    if (isEditMode) {
      setInitialLoading(true);
      runGAS<any>('api_getCustomerById', id!)
        .then(data => {
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            zipCode: data.zipCode || '',
            prefecture: data.prefecture || '',
            city: data.city || '',
            address1: data.address1 || '',
            address2: data.address2 || '',
            status: data.status || 'lead'
          });
          setInitialLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to fetch customer details');
          setInitialLoading(false);
        });
    }
  }, [isEditMode, id]);

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
      if (isEditMode) {
        await runGAS('api_updateCustomer', id!, formData);
      } else {
        await runGAS('api_createCustomer', formData);
      }
      navigate('/customers');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: '20px' }}>Loading customer details...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h1>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h1>
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

          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Address</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Zip Code</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="123-4567"
                  style={{ width: '100px', padding: '8px', fontSize: '16px' }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.zipCode) return;
                    try {
                      const addresses = await runGAS<any>('api_getAddressByZipCode', formData.zipCode);
                      if (addresses && addresses.length > 0) {
                        if (addresses.length === 1) {
                          // Single match - auto-fill
                          setFormData(prev => ({
                            ...prev,
                            prefecture: addresses[0].prefecture,
                            city: addresses[0].city,
                            address1: addresses[0].address1
                          }));
                          setAddressCandidates([]);
                        } else {
                          // Multiple matches - show selection UI
                          setAddressCandidates(addresses);
                        }
                      } else {
                        alert('Address not found');
                        setAddressCandidates([]);
                      }
                    } catch (e) {
                      console.error(e);
                      alert('Failed to lookup address');
                      setAddressCandidates([]);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Lookup Address
                </button>
              </div>
            </div>

            {/* Multiple Address Candidates Selection */}
            {addressCandidates.length > 0 && (
              <div style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f0f8ff',
                border: '1px solid #4CAF50',
                borderRadius: '4px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' }}>
                  Multiple addresses found. Please select one:
                </p>
                {addressCandidates.map((candidate, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        prefecture: candidate.prefecture,
                        city: candidate.city,
                        address1: candidate.address1
                      }));
                      setAddressCandidates([]);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      textAlign: 'left',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    {candidate.prefecture} {candidate.city} {candidate.address1}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prefecture</label>
                <input
                  type="text"
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Reverse Lookup Button */}
            {formData.prefecture && formData.city && !formData.zipCode && (
              <div style={{ marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const zipCode = await runGAS<any>('api_getZipCodeByAddress', formData.prefecture, formData.city, formData.address1 || '');
                      if (zipCode) {
                        setFormData(prev => ({
                          ...prev,
                          zipCode: zipCode
                        }));
                      } else {
                        alert('Zip code not found for this address');
                      }
                    } catch (e) {
                      console.error(e);
                      alert('Failed to lookup zip code. Make sure GOOGLE_MAPS_API_KEY is configured.');
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  ← Lookup Zip Code
                </button>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address 1 (Street)</label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address 2 (Building)</label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
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
              {loading ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Create Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};