import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    mail:"",
    password: "",
    confirmPassword: ""
  });
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Contact management states
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    userId: null,
    tags: []
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    _id: "",
    tags: [],
    isFavorite: false
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'table'
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // 'name', 'recent'
  const [filterTag, setFilterTag] = useState("all");
  const [availableTags, setAvailableTags] = useState(["Family", "Friends", "Work", "Other"]);
  const [newTag, setNewTag] = useState("");
  const backendUrl = import.meta.env.VITE_API_URL;
  const [userId, setUserId] = useState(null);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Mock login function
  const handleLogin = async (e) => {
    console.log("Login Btn Clicked");
    
    e.preventDefault();
    setAuthError("");
    
    if (!loginForm.username || !loginForm.password) {
      setAuthError("Please enter both username and password");
      return;
    }

    try {
      const response  = await axios.post(backendUrl + "auth/login", {
        mail: loginForm.username,
        password: loginForm.password
      });
      if(response.status === 200){  
        setIsLoggedIn(true);
        setAuthSuccess(response.data.message);
        setUserId(response.data.userId);
        setFormData({...formData, userId: response.data.userId});
        setTimeout(() => setAuthSuccess(""), 3000);
      } else {
        console.log(response.data);
        setAuthError(response.data.message || "Login failed");
      }
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
      setAuthError("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    if (!registerForm.username || !registerForm.password) {
      setAuthError("Please fill all fields");
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    
    try {
      const response = await axios.post(backendUrl + "auth/signup", {
        name : registerForm.username,
        mail: registerForm.mail,
        password: registerForm.password
      });
      if (response.status === 201) {
        setAuthSuccess(response.data.message);
        setTimeout(() => setAuthSuccess(""), 3000);
      } else {
        setAuthError(response.data.message || "Registration failed");
      }
    } catch (error) {
      setAuthError("Registration failed");
    }

    setTimeout(() => {
      setAuthSuccess("");
      setAuthMode("login");
    }, 3000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthSuccess("Logged out successfully");
    setTimeout(() => setAuthSuccess(""), 3000);
    setUserId(null);
    setFormData({...formData, userId: null});
  };

  // Contact management functions
  async function getData() {
    try {
      const response = await axios.get(`${backendUrl}user/${userId}`);
      if (response.status === 200) {
        setContacts(response.data);
      } else {
        console.log(response.data);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    if (isLoggedIn && userId) {
      getData();
    }
  }, [isLoggedIn, userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl, {...formData, userId});
      if (response.status === 201) {
        getData();
        setFormData({ name: "", phone: "", email: "", address: "", userId, tags: [] });
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = (contact) => {
    setEditFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      _id: contact._id,
      tags: contact.tags || [],
      isFavorite: contact.isFavorite || false
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(backendUrl + editFormData._id, {...editFormData, userId});
      if (response.status === 200) {
        getData();
        setShowEditModal(false);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await axios.delete(backendUrl + id);
        if (response.status === 204) {
          getData();
        } else {
          console.log(response.data.message);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (contact) => {
    try {
      const updatedContact = {...contact, isFavorite: !contact.isFavorite};
      const response = await axios.put(backendUrl + contact._id, updatedContact);
      if (response.status === 200) {
        getData();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Add tag to contact in edit form
  const addTagToContact = (tag) => {
    if (!editFormData.tags.includes(tag)) {
      setEditFormData({
        ...editFormData,
        tags: [...editFormData.tags, tag]
      });
    }
  };

  // Remove tag from contact in edit form
  const removeTagFromContact = (tagToRemove) => {
    setEditFormData({
      ...editFormData,
      tags: editFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Add new tag to available tags
  const addNewTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      setNewTag("");
    }
  };

  // Export contacts to CSV
  const exportToCSV = () => {
    const headers = "Name,Phone,Email,Address,Tags,Favorite\n";
    const csvContent = contacts.map(contact => 
      `"${contact.name}","${contact.phone}","${contact.email}","${contact.address}","${(contact.tags || []).join(',')}","${contact.isFavorite ? 'Yes' : 'No'}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import contacts from CSV (simplified version)
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // In a real app, you would parse the CSV and send to backend
        alert("CSV import functionality would be implemented here");
      };
      reader.readAsText(file);
    }
  };

  // Highlight search term in text
  const highlightSearchTerm = (text) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  // Get first letter for avatar
  const getAvatarLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = filterTag === "all" || 
        (contact.tags && contact.tags.includes(filterTag)) ||
        (filterTag === "favorites" && contact.isFavorite);
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

  // Login/Register Page
  if (!isLoggedIn) {
    return (
      <div className={`container py-5 ${darkMode ? 'bg-dark text-light' : ''}`} style={{minHeight: '100vh'}}>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h3 className="mb-0">
                  <i className="fas fa-address-book me-2"></i>
                  Contact Manager
                </h3>
                <p className="mb-0">Please {authMode === "login" ? "login" : "register"} to continue</p>
              </div>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${authMode === "login" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setAuthMode("login")}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`btn ${authMode === "register" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setAuthMode("register")}
                    >
                      Register
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="alert alert-danger" role="alert">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="alert alert-success" role="alert">
                    {authSuccess}
                  </div>
                )}

                {authMode === "login" && (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter your Email"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      <i className="fas fa-sign-in-alt me-2"></i>Login
                    </button>
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        You forgot your username: <strong><a href="#">forgot</a></strong>
                      </small>
                    </div>
                  </form>
                )}

                {authMode === "register" && (
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label htmlFor="regUsername" className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        id="regUsername"
                        placeholder="Enter your username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="regMail" className="form-label">Mail</label>
                      <input
                        type="email"
                        className="form-control"
                        id="regMail"
                        placeholder="Enter your mail"
                        value={registerForm.mail}
                        onChange={(e) => setRegisterForm({...registerForm, mail: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="regPassword" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="regPassword"
                        placeholder="Enter your password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      <i className="fas fa-user-plus me-2"></i>Register
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contacts Page (shown after login)
  return (
    <div className={`container py-4 ${darkMode ? 'bg-dark text-light' : ''}`} style={{minHeight: '100vh'}}>
      <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h1 className="display-4 text-primary">
            <i className="fas fa-address-book me-2"></i>
            Contact Manager
          </h1>
          <p className="lead">Manage your contacts efficiently</p>
        </div>
        <div className="d-flex gap-2 align-items-center mt-2">
          <button className="btn btn-outline-secondary" onClick={() => setDarkMode(!darkMode)}>
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        </div>
      </header>

      {authSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {authSuccess}
          <button type="button" className="btn-close" onClick={() => setAuthSuccess("")}></button>
        </div>
      )}

      <div className="row">
        {/* Form Section */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Add New Contact</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows="2"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="fas fa-plus-circle me-2"></i>Add Contact
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Contacts List Section */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap">
              <h5 className="card-title mb-2 mb-md-0">Contacts</h5>
              
              <div className="d-flex flex-wrap gap-2">
                <div className="input-group me-2" style={{width: '200px'}}>
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="form-select me-2" 
                  style={{width: '120px'}}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="recent">Sort by Recent</option>
                </select>
                
                <select 
                  className="form-select me-2" 
                  style={{width: '120px'}}
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="all">All Contacts</option>
                  <option value="favorites">Favorites</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                
                <div className="btn-group">
                  <button 
                    className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                  <button 
                    className={`btn btn-outline-primary ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <i className="fas fa-table"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              <div className="d-flex justify-content-between p-3 border-bottom">
                <span className="text-muted">
                  Showing {filteredContacts.length} of {contacts.length} contacts
                </span>
                <div>
                  <button className="btn btn-sm btn-outline-success me-2" onClick={exportToCSV}>
                    <i className="fas fa-download me-1"></i>Export
                  </button>
                  <label className="btn btn-sm btn-outline-info mb-0">
                    <i className="fas fa-upload me-1"></i>Import
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleImport} 
                      style={{display: 'none'}} 
                    />
                  </label>
                </div>
              </div>
              
              {filteredContacts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-address-book fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    {contacts.length === 0
                      ? "No contacts added yet. Start by adding a new contact!"
                      : "No contacts match your search."}
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                // Table View
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact, index) => (
                        <tr key={index}>
                          <td>
                            <div 
                              className="avatar-circle-sm bg-primary text-white d-flex align-items-center justify-content-center rounded-circle"
                              style={{width: '35px', height: '35px'}}
                            >
                              {getAvatarLetter(contact.name)}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {highlightSearchTerm(contact.name)}
                              {contact.isFavorite && (
                                <i className="fas fa-star text-warning ms-2"></i>
                              )}
                            </div>
                            <div className="small text-muted">
                              {(contact.tags || []).map(tag => (
                                <span key={tag} className="badge bg-secondary me-1">{tag}</span>
                              ))}
                            </div>
                          </td>
                          <td>{highlightSearchTerm(contact.phone)}</td>
                          <td>{contact.email ? highlightSearchTerm(contact.email) : '-'}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(contact)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(contact._id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                className={`btn ${contact.isFavorite ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => toggleFavorite(contact)}
                                title="Favorite"
                              >
                                <i className="fas fa-star"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // List View (Cards)
                <div className="list-group list-group-flush">
                  {filteredContacts.map((contact, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center">
                          <div 
                            className="avatar-circle-sm bg-primary text-white d-flex align-items-center justify-content-center rounded-circle me-3"
                            style={{width: '45px', height: '45px', minWidth: '45px'}}
                          >
                            {getAvatarLetter(contact.name)}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 d-flex align-items-center">
                              {highlightSearchTerm(contact.name)}
                              {contact.isFavorite && (
                                <i className="fas fa-star text-warning ms-2"></i>
                              )}
                            </h6>
                            <p className="mb-1">
                              <i className="fas fa-phone text-muted me-2"></i>
                              {highlightSearchTerm(contact.phone)}
                            </p>
                            {contact.email && (
                              <p className="mb-1 small">
                                <i className="fas fa-envelope text-muted me-2"></i>
                                {highlightSearchTerm(contact.email)}
                              </p>
                            )}
                            {contact.address && (
                              <p className="mb-0 small text-muted">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {highlightSearchTerm(contact.address)}
                              </p>
                            )}
                            <div className="mt-1">
                              {(contact.tags || []).map(tag => (
                                <span key={tag} className="badge bg-secondary me-1">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(contact)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(contact._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button
                            className={`btn btn-sm ${contact.isFavorite ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => toggleFavorite(contact)}
                            title="Favorite"
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Contact Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Contact</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label htmlFor="editName" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editName"
                      name="name"
                      placeholder="Enter name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editPhone" className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editPhone"
                      name="phone"
                      placeholder="Enter phone number"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="editEmail"
                      name="email"
                      placeholder="Enter email address"
                      value={editFormData.email}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editAddress" className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      id="editAddress"
                      name="address"
                      rows="3"
                      placeholder="Enter address"
                      value={editFormData.address}
                      onChange={handleEditChange}
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {editFormData.tags.map(tag => (
                        <span key={tag} className="badge bg-primary d-flex align-items-center">
                          {tag}
                          <button 
                            type="button" 
                            className="btn-close btn-close-white ms-1" 
                            style={{fontSize: '0.6rem'}}
                            onClick={() => removeTagFromContact(tag)}
                          ></button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="input-group">
                      <select 
                        className="form-select" 
                        onChange={(e) => e.target.value && addTagToContact(e.target.value)}
                        value=""
                      >
                        <option value="">Select a tag</option>
                        {availableTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => {
                          const tag = prompt("Enter new tag:");
                          if (tag && !availableTags.includes(tag)) {
                            setAvailableTags([...availableTags, tag]);
                            addTagToContact(tag);
                          } else if (tag) {
                            addTagToContact(tag);
                          }
                        }}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editFavorite"
                      checked={editFormData.isFavorite}
                      onChange={(e) => setEditFormData({...editFormData, isFavorite: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="editFavorite">
                      Mark as favorite
                    </label>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary w-50" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary w-50">
                      <i className="fas fa-save me-2"></i>Update Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showEditModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default App;