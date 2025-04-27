// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  accessibleWebhooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Webhook' }]
});

const webhookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String }
});

const User = mongoose.model('User', userSchema);
const Webhook = mongoose.model('Webhook', webhookSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

app.get('/', (req, res) => {
  res.send('API server is running');
});

// Admin-only webhook management routes
app.post('/api/google/chat/webhooks', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, url, description } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }
    
    // Validate webhook URL format
    if (!url.startsWith('https://chat.googleapis.com/v1/spaces/')) {
      return res.status(400).json({ 
        message: 'Invalid webhook URL format. Must start with https://chat.googleapis.com/v1/spaces/' 
      });
    }
    
    const webhook = new Webhook({
      name,
      url,
      description: description || ''
    });
    
    await webhook.save();
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/google/chat/webhooks/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, url, description } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }
    
    // Validate webhook URL format
    if (!url.startsWith('https://chat.googleapis.com/v1/spaces/')) {
      return res.status(400).json({ 
        message: 'Invalid webhook URL format. Must start with https://chat.googleapis.com/v1/spaces/' 
      });
    }
    
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      { name, url, description },
      { new: true, runValidators: true }
    );
    
    if (!updatedWebhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.status(200).json(updatedWebhook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/google/chat/webhooks/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndDelete(req.params.id);
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user webhook access (admin only)
app.put('/api/users/:userId/webhooks', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { webhookIds } = req.body;
    
    if (!Array.isArray(webhookIds)) {
      return res.status(400).json({ message: 'webhookIds must be an array' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accessibleWebhooks: webhookIds },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    // Check if user already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).json({ message: 'Email already exists' });
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Create new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    
    // Save user to DB
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// In server.js, modify the login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    console.log('User found:', !!user);
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect' });
    
    // Test direct password comparison
    console.log('User password hash:', user.password);
    console.log('Entered password:', req.body.password);
    
    // Validate password
    console.log('Validating password...');
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) return res.status(401).json({ message: 'Email or password is incorrect' });
    
    // Check JWT_SECRET
    console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in .env file');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Create token
    console.log('Creating token...');
    try {
      const token = jwt.sign(
        { _id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('Token created successfully');
      
      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role // Add this line
        }
      });
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email
  });
});

// Trello API routes
app.get('/api/trello/boards/:boardId', authenticateToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const response = await axios.get(`https://api.trello.com/1/boards/${boardId}`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch board data',
      error: error.response?.data || error.message
    });
  }
});

app.get('/api/trello/boards/:boardId/lists', authenticateToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, {
      params: {
        cards: 'open',
        card_fields: 'name,desc,labels,due,dueComplete,url',
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch lists data',
      error: error.response?.data || error.message
    });
  }
});

// Google Chat webhook routes
// Get all webhooks
app.get('/api/google/chat/webhooks', authenticateToken, async (req, res) => {
  console.log('Webhook GET request received');
  try {
    // Admins can see all webhooks
    if (req.user.role === 'admin') {
      const webhooks = await Webhook.find({});
      return res.status(200).json(webhooks);
    }
    
    // Regular users only see webhooks they have access to
    const user = await User.findById(req.user._id);
    const webhooks = await Webhook.find({
      _id: { $in: user.accessibleWebhooks }
    });
    
    res.status(200).json(webhooks);
  } catch (error) {
    console.error('Error in GET webhooks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Craate a new webhook
app.post('/api/google/chat/webhooks', authenticateToken, async (req, res) => {
  try {
    const { name, url, description } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }
    
    // Validate webhook URL format
    if (!url.startsWith('https://chat.googleapis.com/v1/spaces/')) {
      return res.status(400).json({ 
        message: 'Invalid webhook URL format. Must start with https://chat.googleapis.com/v1/spaces/' 
      });
    }
    
    const webhook = new Webhook({
      name,
      url,
      description: description || ''
    });
    
    await webhook.save();
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing webhook
app.put('/api/google/chat/webhooks/:id', authenticateToken, async (req, res) => {
  try {
    const { name, url, description } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }
    
    // Validate webhook URL format
    if (!url.startsWith('https://chat.googleapis.com/v1/spaces/')) {
      return res.status(400).json({ 
        message: 'Invalid webhook URL format. Must start with https://chat.googleapis.com/v1/spaces/' 
      });
    }
    
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      { name, url, description },
      { new: true, runValidators: true }
    );
    
    if (!updatedWebhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.status(200).json(updatedWebhook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a webhook
app.delete('/api/google/chat/webhooks/:id', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndDelete(req.params.id);
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/google/chat/send/:cardId', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { caption, webhookId } = req.body;
    
    // Get webhook URL
    const webhook = await Webhook.findById(webhookId);
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    
    // Get card details
    const cardResponse = await axios.get(`https://api.trello.com/1/cards/${cardId}`, {
      params: {
        fields: 'name,desc,due,dueComplete,url',
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });
    
    const card = cardResponse.data;
    
    // Get card labels
    const labelsResponse = await axios.get(`https://api.trello.com/1/cards/${cardId}/labels`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });
    
    const labels = labelsResponse.data;
    
    // Extract presensi link
    const presensiLink = extractLink(card.desc, 'Link Presensi');
    
    // Prepare message for Google Chat
    const message = {
      cardsV2: [{
        cardId: `trello-card-${card.id}`,
        card: {
          header: {
            title: `📌 ${card.name}`,
            subtitle: `Sent to ${webhook.name}`
          },
          sections: [
            // Add caption kalo ada
            ...(caption ? [{
              widgets: [{
                textParagraph: { text: `🏷️ ${caption}` }
              }]
            }] : []),
            
            // Add presensi link kalo ada
            {
              widgets: [{
                textParagraph: { 
                  text: presensiLink 
                    ? `• <b>Link Presensi Online:</b> <a href="${presensiLink.url}">${presensiLink.text}</a>`
                    : 'Tidak ditemukan link'
                }
              }]
            },
            
            // Add labels and due date if available
            ...(labels.length > 0 || card.due ? [{
              widgets: [{
                textParagraph: { 
                  text: `${labels.length > 0 ? `<b>Labels:</b> ${labels.map(l => l.name).join(', ')}<br>` : ''}${card.due ? `<b>Due date:</b> ${new Date(card.due).toLocaleDateString()} ${card.dueComplete ? '(Completed)' : ''}` : ''}`.trim() 
                }
              }]
            }] : []),
            
            // Add link to Trello card
            {
              widgets: [{
                buttonList: {
                  buttons: [{
                    text: "🔗 Lihat di Trello",
                    onClick: { openLink: { url: card.url } }
                  }]
                }
              }]
            }
          ]
        }
      }]
    };
    
    console.log('Sending message to Google Chat:', JSON.stringify(message).substring(0, 200) + '...');
    
    // Send to Google Chat
    const chatResponse = await axios.post(webhook.url, message);
    console.log('Google Chat response:', chatResponse.status, chatResponse.statusText);
    
    res.status(200).json({ message: 'Successfully sent to Google Chat' });
  } catch (error) {
    console.error('Error sending to Google Chat:', error);
    res.status(500).json({ 
      message: 'Failed to send to Google Chat',
      error: error.response?.data || error.message
    });
  }
});

// Helper function to extract links from description
function extractLink(desc, label) {
  if (!desc || !label) return null;

  // Remove colon at end of label if present
  const cleanLabel = label.replace(/:$/, '');
  
  // Match full markdown format: [text](url)
  let match = desc.match(new RegExp(`${cleanLabel}:\\s*\\[(.*?)\\]\\((https?:\\/\\/[^\\s)]+)`, 'i'));
  if (match && match[2]) {
    return {
      text: match[1].trim(),
      url: match[2].trim()
    };
  }
  
  // Match short format: [url]
  match = desc.match(new RegExp(`${cleanLabel}:\\s*\\[(https?:\\/\\/[^\\]\\s]+)\\]`, 'i'));
  if (match && match[1]) {
    return {
      text: match[1].trim(),
      url: match[1].trim()
    };
  }
  
  return null;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


