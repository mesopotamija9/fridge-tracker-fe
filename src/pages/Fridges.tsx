import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Modal, ListGroup, Badge } from 'react-bootstrap';
import { fridgesApi, itemsApi } from '../services/api';
import { isApiError } from '../types/api';

interface Item {
  id: string;
  name: string;
  createdOn: string;
}

interface FridgeItem {
  id: string;
  fridgeId: string;
  itemId: string;
  itemName: string;
  bestBeforeDate: string;
  storedAt: string;
}

interface Fridge {
  id: string;
  name: string;
  createdOn: string;
}

interface SortState {
  field: 'storedAt' | 'bestBeforeDate';
  direction: 'asc' | 'desc';
}

interface ItemStats {
  id: string;
  name: string;
  count: number;
}

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
};

export const Fridges = () => {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [fridgeItems, setFridgeItems] = useState<{ [key: string]: FridgeItem[] }>({});
  const [newFridgeName, setNewFridgeName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedFridge, setSelectedFridge] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [bestBeforeDate, setBestBeforeDate] = useState('');
  const [storedAt, setStoredAt] = useState('');
  const [editingFridgeItem, setEditingFridgeItem] = useState<FridgeItem | null>(null);
  const [sortStates, setSortStates] = useState<{ [fridgeId: string]: SortState }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFridgeForDetails, setSelectedFridgeForDetails] = useState<string>('');

  const loadFridges = async () => {
    try {
      const response = await fridgesApi.getAll();
      if (isApiError(response.data)) {
        setError(response.data.message);
        return;
      }
      setFridges(response.data);
      response.data.forEach((fridge: Fridge) => {
        loadFridgeItems(fridge.id);
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const loadItems = async () => {
    try {
      const response = await itemsApi.getAll();
      if (isApiError(response.data)) {
        setError(response.data.message);
        return;
      }
      setItems(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const loadFridgeItems = async (fridgeId: string) => {
    try {
      const response = await fridgesApi.getItems(fridgeId);
      if (isApiError(response.data)) {
        setError(response.data.message);
        return;
      }
      setFridgeItems(prev => ({
        ...prev,
        [fridgeId]: response.data
      }));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    loadFridges();
    loadItems();
  }, []);

  const handleCreateFridge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fridgesApi.create(newFridgeName);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setNewFridgeName('');
      setSuccess('Fridge created successfully');
      loadFridges();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteFridge = async (id: string) => {
    try {
      const response = await fridgesApi.delete(id);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Fridge deleted successfully');
      loadFridges();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItem || !selectedFridge || !bestBeforeDate || !storedAt) return;

    try {
      const response = await fridgesApi.addItem(
        selectedFridge,
        selectedItem,
        bestBeforeDate,
        storedAt
      );
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Item added to fridge successfully');
      loadFridgeItems(selectedFridge);
      setShowAddItemModal(false);
      resetAddItemForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveItem = async (fridgeId: string, fridgeItemId: string) => {
    try {
      const response = await fridgesApi.removeItem(fridgeId, fridgeItemId);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Item removed from fridge successfully');
      loadFridgeItems(fridgeId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetAddItemForm = () => {
    setSelectedItem('');
    setBestBeforeDate('');
    setStoredAt('');
  };

  const openAddItemModal = (fridgeId: string) => {
    setSelectedFridge(fridgeId);
    setShowAddItemModal(true);
  };

  const handleEditFridgeItem = async () => {
    if (!editingFridgeItem || !bestBeforeDate || !storedAt) return;

    try {
      const response = await fridgesApi.updateItem(
        editingFridgeItem.fridgeId,
        editingFridgeItem.id,
        bestBeforeDate,
        storedAt
      );
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Item updated successfully');
      loadFridgeItems(editingFridgeItem.fridgeId);
      setShowEditItemModal(false);
      setBestBeforeDate('');
      setStoredAt('');
      setEditingFridgeItem(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditItemModal = (fridgeItem: FridgeItem) => {
    setEditingFridgeItem(fridgeItem);
    setBestBeforeDate(formatDateForInput(fridgeItem.bestBeforeDate));
    setStoredAt(formatDateForInput(fridgeItem.storedAt));
    setShowEditItemModal(true);
  };

  const getSortedFridgeItems = (items: FridgeItem[], fridgeId: string) => {
    const sortState = sortStates[fridgeId] || { field: 'storedAt', direction: 'asc' };
    return [...items].sort((a, b) => {
      const aValue = new Date(a[sortState.field]).getTime();
      const bValue = new Date(b[sortState.field]).getTime();
      return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const toggleSort = (field: 'storedAt' | 'bestBeforeDate', fridgeId: string) => {
    setSortStates(prevStates => {
      const currentState = prevStates[fridgeId] || { field: 'storedAt', direction: 'asc' };
      const newDirection = 
        currentState.field === field 
          ? currentState.direction === 'asc' ? 'desc' : 'asc'
          : 'asc';
      
      return {
        ...prevStates,
        [fridgeId]: { field, direction: newDirection }
      };
    });
  };

  const getExpirationStatus = (bestBeforeDate: string) => {
    const now = new Date();
    const expirationDate = new Date(bestBeforeDate);
    if (expirationDate < now) {
      return { status: 'expired', progress: 100 };
    }
    
    const totalDays = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const progress = Math.max(0, Math.min(100, (1 - totalDays / 30) * 100)); // Assuming 30 days is full scale
    return { status: 'valid', progress };
  };

  const getFilteredItems = () => {
    if (!searchTerm) return [];
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item.id);
    setSearchTerm(item.name);
    setShowSuggestions(false);
  };

  const getItemStats = (fridgeItems: FridgeItem[]): { active: ItemStats[], expired: ItemStats[] } => {
    const now = new Date();
    const itemCounts: { [key: string]: { name: string, count: number } } = {};
    const expiredItemCounts: { [key: string]: { name: string, count: number } } = {};

    fridgeItems.forEach(item => {
      const isExpired = new Date(item.bestBeforeDate) < now;
      const counts = isExpired ? expiredItemCounts : itemCounts;
      
      if (!counts[item.itemId]) {
        counts[item.itemId] = { name: item.itemName, count: 0 };
      }
      counts[item.itemId].count++;
    });

    const active = Object.entries(itemCounts).map(([id, { name, count }]) => ({
      id,
      name,
      count
    })).sort((a, b) => a.name.localeCompare(b.name));

    const expired = Object.entries(expiredItemCounts).map(([id, { name, count }]) => ({
      id,
      name,
      count
    })).sort((a, b) => a.name.localeCompare(b.name));

    return { active, expired };
  };

  const openDetailsModal = (fridgeId: string) => {
    setSelectedFridgeForDetails(fridgeId);
    setShowDetailsModal(true);
  };

  return (
    <Container className="mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>My Fridges</h2>
        <Form onSubmit={handleCreateFridge} className="d-flex align-items-center gap-3" style={{ width: '100%', maxWidth: '450px' }}>
          <Form.Control
            type="text"
            value={newFridgeName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFridgeName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="Enter fridge name"
            className="flex-grow-1 shadow-sm"
            style={{ 
              height: '45px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
          <Button 
            type="submit" 
            variant="primary"
            style={{ 
              height: '45px', 
              width: '160px',
              borderRadius: '12px',
              backgroundColor: '#3498db',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            Add Fridge
          </Button>
        </Form>
      </div>

      {error && <Alert variant="danger" className="mb-4 rounded-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4 rounded-3">{success}</Alert>}

      <div className="row g-4">
        {fridges.map((fridge) => {
          const sortState = sortStates[fridge.id] || { field: 'storedAt', direction: 'asc' };
          return (
            <div key={fridge.id} className="col-12 col-md-6">
              <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
                <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                  <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                    <h5 className="mb-0" style={{ color: '#2c3e50', fontWeight: '600' }}>{fridge.name}</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => openAddItemModal(fridge.id)}
                        style={{ 
                          height: '34px',
                          width: '90px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontWeight: '500',
                          fontSize: '0.85rem'
                        }}
                      >
                        Add Item
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => openDetailsModal(fridge.id)}
                        style={{ 
                          height: '34px',
                          width: '90px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontWeight: '500',
                          fontSize: '0.85rem'
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteFridge(fridge.id)}
                        style={{ 
                          height: '34px',
                          width: '90px',
                          borderRadius: '10px',
                          backgroundColor: '#ff6b6b',
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <Button
                      variant={sortState.field === 'storedAt' ? 'primary' : 'light'}
                      size="sm"
                      onClick={() => toggleSort('storedAt', fridge.id)}
                      style={{ 
                        borderRadius: '8px',
                        border: sortState.field === 'storedAt' ? 'none' : '1px solid #e2e8f0',
                        backgroundColor: sortState.field === 'storedAt' ? '#3498db' : '#ffffff',
                        fontWeight: '500',
                        fontSize: '0.85rem'
                      }}
                    >
                      Storage Date {sortState.field === 'storedAt' && (sortState.direction === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant={sortState.field === 'bestBeforeDate' ? 'primary' : 'light'}
                      size="sm"
                      onClick={() => toggleSort('bestBeforeDate', fridge.id)}
                      style={{ 
                        borderRadius: '8px',
                        border: sortState.field === 'bestBeforeDate' ? 'none' : '1px solid #e2e8f0',
                        backgroundColor: sortState.field === 'bestBeforeDate' ? '#3498db' : '#ffffff',
                        fontWeight: '500',
                        fontSize: '0.85rem'
                      }}
                    >
                      Expiration {sortState.field === 'bestBeforeDate' && (sortState.direction === 'asc' ? '↑' : '↓')}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0 px-4">
                  <ListGroup variant="flush">
                    {getSortedFridgeItems(fridgeItems[fridge.id] || [], fridge.id).map((fridgeItem) => {
                      const { status, progress } = getExpirationStatus(fridgeItem.bestBeforeDate);
                      return (
                        <ListGroup.Item
                          key={fridgeItem.id}
                          className="py-4 border-bottom"
                          style={{ transition: 'all 0.2s ease-in-out' }}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h6 className="mb-2" style={{ color: '#2c3e50', fontWeight: '500' }}>{fridgeItem.itemName}</h6>
                              <div className="progress mb-2" style={{ height: '4px', backgroundColor: '#f1f5f9' }}>
                                <div
                                  className={`progress-bar ${status === 'expired' ? 'bg-danger' : progress > 70 ? 'bg-warning' : 'bg-success'}`}
                                  role="progressbar"
                                  style={{ 
                                    width: `${progress}%`,
                                    transition: 'width 0.3s ease'
                                  }}
                                  aria-valuenow={progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <div className="d-flex flex-column gap-1">
                                <small className={`d-block ${status === 'expired' ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.85rem' }}>
                                  Best before: {formatDate(fridgeItem.bestBeforeDate)}
                                  {status === 'expired' && <span className="ms-2">(Expired)</span>}
                                </small>
                                <small className="text-muted d-block" style={{ fontSize: '0.85rem' }}>
                                  Stored at: {formatDate(fridgeItem.storedAt)}
                                </small>
                              </div>
                            </div>
                            <div className="d-flex gap-2 align-items-start">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => openEditItemModal(fridgeItem)}
                                style={{ 
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  fontWeight: '500',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveItem(fridge.id, fridgeItem.id)}
                                style={{ 
                                  borderRadius: '8px',
                                  backgroundColor: '#ff6b6b',
                                  border: 'none',
                                  fontWeight: '500',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                    {(!fridgeItems[fridge.id] || fridgeItems[fridge.id].length === 0) && (
                      <ListGroup.Item className="text-center py-5 border-0">
                        <div style={{ color: '#94a3b8' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="mb-3">
                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                          </svg>
                          <h5 style={{ color: '#64748b', fontWeight: '500' }}>No items in this fridge</h5>
                          <p className="mb-0" style={{ color: '#94a3b8' }}>Add your first item to get started</p>
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          );
        })}
        {fridges.length === 0 && (
          <div className="col-12">
            <Card className="shadow-sm border-0" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
              <ListGroup variant="flush">
                <ListGroup.Item className="text-center py-5">
                  <div style={{ color: '#94a3b8' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="mb-3">
                      <path d="M3 14V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12h1a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2h1zm2-7h6M5 11h6"/>
                      <path d="M5 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-2z"/>
                    </svg>
                    <h5 style={{ color: '#64748b', fontWeight: '500' }}>No fridges yet</h5>
                    <p className="mb-0" style={{ color: '#94a3b8' }}>Create your first fridge to get started</p>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </div>
        )}
      </div>

      <Modal 
        show={showAddItemModal} 
        onHide={() => {
          setShowAddItemModal(false);
          setSearchTerm('');
          setSelectedItem('');
          setShowSuggestions(false);
        }}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: '#2c3e50', fontWeight: '600' }}>Add Item to Fridge</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4">
          <Form>
            <Form.Group className="mb-4 position-relative">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Select Item</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedItem('');
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for an item..."
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
              {showSuggestions && searchTerm && (
                <div 
                  className="position-absolute w-100 shadow-sm bg-white border rounded-3 mt-1" 
                  style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    zIndex: 1050,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {getFilteredItems().map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2"
                      onClick={() => handleSelectItem(item)}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease-in-out',
                        color: '#2c3e50'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                  {getFilteredItems().length === 0 && (
                    <div className="px-3 py-2" style={{ color: '#94a3b8' }}>
                      No items found
                    </div>
                  )}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Stored At Date</Form.Label>
              <Form.Control
                type="date"
                value={storedAt}
                onChange={(e) => setStoredAt(e.target.value)}
                required
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Best Before Date</Form.Label>
              <Form.Control
                type="date"
                value={bestBeforeDate}
                onChange={(e) => setBestBeforeDate(e.target.value)}
                required
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button 
            variant="light"
            onClick={() => {
              setShowAddItemModal(false);
              setSearchTerm('');
              setSelectedItem('');
              setShowSuggestions(false);
            }}
            style={{ 
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              fontWeight: '500'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleAddItem}
            disabled={!selectedItem || !storedAt || !bestBeforeDate}
            style={{ 
              borderRadius: '10px',
              backgroundColor: '#3498db',
              border: 'none',
              padding: '8px 16px',
              fontWeight: '500'
            }}
          >
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showEditItemModal} 
        onHide={() => setShowEditItemModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: '#2c3e50', fontWeight: '600' }}>Edit Item Dates</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Stored At Date</Form.Label>
              <Form.Control
                type="date"
                value={storedAt}
                onChange={(e) => setStoredAt(e.target.value)}
                required
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Best Before Date</Form.Label>
              <Form.Control
                type="date"
                value={bestBeforeDate}
                onChange={(e) => setBestBeforeDate(e.target.value)}
                required
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button 
            variant="light"
            onClick={() => setShowEditItemModal(false)}
            style={{ 
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              fontWeight: '500'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleEditFridgeItem}
            style={{ 
              borderRadius: '10px',
              backgroundColor: '#3498db',
              border: 'none',
              padding: '8px 16px',
              fontWeight: '500'
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: '#2c3e50', fontWeight: '600' }}>
            {fridges.find(f => f.id === selectedFridgeForDetails)?.name} - Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4">
          {selectedFridgeForDetails && (
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <h6 style={{ color: '#3498db', fontWeight: '600', marginBottom: '1rem' }}>Fresh Items</h6>
                  <ListGroup variant="flush">
                    {getItemStats(fridgeItems[selectedFridgeForDetails] || []).active.map((stat) => (
                      <ListGroup.Item 
                        key={stat.id}
                        className="d-flex justify-content-between align-items-center px-0 py-3"
                        style={{ borderColor: '#f1f5f9' }}
                      >
                        <span style={{ color: '#2c3e50', fontWeight: '500' }}>{stat.name}</span>
                        <Badge 
                          bg="primary" 
                          pill
                          style={{ 
                            backgroundColor: '#3498db',
                            fontSize: '0.85rem',
                            padding: '0.35em 0.8em'
                          }}
                        >
                          {stat.count}
                        </Badge>
                      </ListGroup.Item>
                    ))}
                    {getItemStats(fridgeItems[selectedFridgeForDetails] || []).active.length === 0 && (
                      <ListGroup.Item className="px-0 py-3" style={{ color: '#94a3b8' }}>
                        No fresh items
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <h6 style={{ color: '#ff6b6b', fontWeight: '600', marginBottom: '1rem' }}>Expired Items</h6>
                  <ListGroup variant="flush">
                    {getItemStats(fridgeItems[selectedFridgeForDetails] || []).expired.map((stat) => (
                      <ListGroup.Item 
                        key={stat.id}
                        className="d-flex justify-content-between align-items-center px-0 py-3"
                        style={{ borderColor: '#f1f5f9' }}
                      >
                        <span style={{ color: '#2c3e50', fontWeight: '500' }}>{stat.name}</span>
                        <Badge 
                          bg="danger" 
                          pill
                          style={{ 
                            backgroundColor: '#ff6b6b',
                            fontSize: '0.85rem',
                            padding: '0.35em 0.8em'
                          }}
                        >
                          {stat.count}
                        </Badge>
                      </ListGroup.Item>
                    ))}
                    {getItemStats(fridgeItems[selectedFridgeForDetails] || []).expired.length === 0 && (
                      <ListGroup.Item className="px-0 py-3" style={{ color: '#94a3b8' }}>
                        No expired items
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button 
            variant="light"
            onClick={() => setShowDetailsModal(false)}
            style={{ 
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              fontWeight: '500'
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}; 