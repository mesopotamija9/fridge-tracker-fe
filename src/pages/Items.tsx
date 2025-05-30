import { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Alert, Modal, Card } from 'react-bootstrap';
import { itemsApi } from '../services/api';
import { isApiError } from '../types/api';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
};

interface Item {
  id: string;
  name: string;
  createdOn: string;
}

export const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editItemName, setEditItemName] = useState('');

  const loadItems = async () => {
    try {
      const response = await itemsApi.getAll();
      if (isApiError(response.data)) {
        setError(response.data.message);
        return;
      }
      const sortedItems = [...response.data].sort((a, b) => a.name.localeCompare(b.name));
      setItems(sortedItems);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await itemsApi.create(newItemName);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setNewItemName('');
      setSuccess('Item created successfully');
      loadItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await itemsApi.delete(id);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Item deleted successfully');
      loadItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await itemsApi.update(editingItem.id, editItemName);
      if (isApiError(response.data)) {
        setError(response.data.message);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSuccess('Item updated successfully');
      loadItems();
      setShowEditModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>My Items</h2>
        <Form onSubmit={handleSubmit} className="d-flex align-items-center gap-3" style={{ width: '100%', maxWidth: '450px' }}>
          <Form.Control
            type="text"
            value={newItemName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="Enter item name (2-100 characters)"
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
            Add Item
          </Button>
        </Form>
      </div>

      {error && <Alert variant="danger" className="mb-4 rounded-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4 rounded-3">{success}</Alert>}

      <Card className="shadow-sm border-0" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
        <ListGroup variant="flush">
          {items.map((item) => (
            <ListGroup.Item
              key={item.id}
              className="py-4 px-4 border-bottom"
              style={{ transition: 'all 0.2s ease-in-out' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1" style={{ color: '#2c3e50', fontWeight: '500' }}>{item.name}</h5>
                  <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Added {formatDate(item.createdOn)}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    className="px-3 py-2"
                    style={{ 
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2"
                    style={{ 
                      borderRadius: '10px',
                      backgroundColor: '#ff6b6b',
                      border: 'none',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
          {items.length === 0 && (
            <ListGroup.Item className="text-center py-5">
              <div style={{ color: '#94a3b8' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="mb-3">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
                <h5 style={{ color: '#64748b', fontWeight: '500' }}>No items yet</h5>
                <p className="mb-0" style={{ color: '#94a3b8' }}>Create your first item to get started</p>
              </div>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: '#2c3e50', fontWeight: '600' }}>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={editItemName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditItemName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Enter item name (2-100 characters)"
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
            onClick={() => setShowEditModal(false)}
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
            onClick={handleEdit}
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
    </Container>
  );
}; 