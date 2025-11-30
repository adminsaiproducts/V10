// frontend/src/App.tsx
import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { runGAS } from './lib/api'
import { ErrorBanner } from './components/ErrorBanner'
import { CustomerForm } from './components/CustomerForm'

// Simple Customer Detail Component
const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    
    setLoading(true)
    runGAS<any>('api_getCustomerById', id)
      .then(data => {
        setCustomer(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div>Loading customer details...</div>
  if (error) return (
    <div style={{ padding: '20px' }}>
      <Link to="/customers">← Back to List</Link>
      <div style={{ marginTop: '20px' }}>
        <ErrorBanner message={error} />
      </div>
    </div>
  )
  if (!customer) return <div>Customer not found</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>{customer.name}</h1>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/customers">← Back to List</Link>
        <Link to={`/customers/${customer.id}/edit`} style={{
          backgroundColor: '#ff9800',
          color: 'white',
          padding: '5px 10px',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px'
        }}>Edit</Link>
      </div>
      
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
        <p><strong>ID:</strong> {customer.id}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
        <p><strong>Status:</strong> {customer.status}</p>
        <p><strong>Created At:</strong> {new Date(customer.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(customer.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}

// Simple Home Component
const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1>CRM V10 Dashboard</h1>
    <p>Welcome to the new Clean Architecture CRM.</p>
    <Link to="/customers">View Customers</Link>
  </div>
)

// Simple Customers Component
const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchCustomers = (query: string, pageNum: number) => {
    setLoading(true)
    setError('')
    
    if (query) {
      // Search mode (currently returns all results, no server-side pagination for search yet)
      runGAS<any[]>('api_searchCustomers', query)
        .then(data => {
          setCustomers(data)
          setTotal(data.length)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    } else {
      // List mode (paginated)
      runGAS<any>('api_getCustomersPaginated', pageNum, pageSize)
        .then(response => {
          setCustomers(response.customers)
          setTotal(response.total)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }

  // Initial load and page changes
  useEffect(() => {
    fetchCustomers(searchQuery, page)
  }, [page]) // Dependent on page. Note: searchQuery triggers explicit search via form.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (page === 1) {
      fetchCustomers(searchQuery, 1)
    } else {
      setPage(1)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / pageSize)) {
      setPage(newPage)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer List</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">Back to Home</Link>
        <Link to="/customers/new" style={{
          backgroundColor: '#646cff',
          color: 'white',
          padding: '8px 16px',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>+ New Customer</Link>
      </div>
      
      <form onSubmit={handleSearch} style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone..."
          style={{ padding: '8px', width: '300px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ErrorBanner message={error} onClose={() => setError('')} />
          <div style={{ marginBottom: '10px' }}>
            {searchQuery ? (
              <span>Found {total} results for "{searchQuery}"</span>
            ) : (
              <span>Total Customers: {total}</span>
            )}
          </div>

          <ul>
            {customers.length === 0 ? (
              <li>No customers found.</li>
            ) : (
              customers.map(c => (
                <li key={c.id}>
                  <Link to={`/customers/${c.id}`} style={{ fontWeight: 'bold' }}>{c.name}</Link>
                  {' '}({c.email}) - {c.status}
                </li>
              ))
            )}
          </ul>

          {!searchQuery && total > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={{ padding: '5px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                style={{ padding: '5px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
      </Routes>
    </HashRouter>
  )
}

export default App
