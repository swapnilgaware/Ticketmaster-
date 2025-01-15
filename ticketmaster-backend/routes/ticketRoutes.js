const express = require('express');
const Ticket = require('../models/Ticket');
const { Client } = require('@elastic/elasticsearch');

const router = express.Router();
const client = new Client({
  node: process.env.ELASTIC_URI || 'http://localhost:9200',
});
// Get paginated tickets
router.get('/paginated', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const tickets = await Ticket.find()
      .sort({ id: 1 }) // Sort by ID
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json(tickets);
  } catch (err) {
    console.error('Error fetching paginated tickets:', err);
    res.status(500).send('Server Error');
  }
});

// Get all tickets (lazy-loading)
router.get('/', async (req, res) => {
  const { offset = 0, limit = 20 } = req.query;

  try {
    const tickets = await Ticket.find()
      .sort({ id: 1 }) // Sort by ID
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json(tickets);
  } catch (err) {
    console.error('Error fetching lazy-loaded tickets:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new ticket
router.post('/create', async (req, res) => {
  try {
    const { id, name } = req.body;

    // Validate input
    if (!id || !name) {
      return res.status(400).json({ message: 'ID and Name are required' });
    }

    const ticket = new Ticket({ id, name });
    await ticket.save();

    // Index ticket in Elasticsearch
    await client.index({
      index: 'tickets',
      id: id.toString(),
      document: { id, name },
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Search tickets with Elasticsearch
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    try {
      const tickets = await Ticket.find().sort({ id: 1 });
      return res.json(tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  try {
    const result = await client.search({
      index: 'tickets',
      query: {
        wildcard: {
          name: `*${query}*`, // Wildcard for partial word search
        },
      },
      sort: [{ id: 'asc' }],
    });

    const tickets = result.hits.hits.map((hit) => hit._source);
    res.json(tickets);
  } catch (err) {
    console.error('Error searching tickets in Elasticsearch:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Edit a ticket
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { id: parseInt(id) },
      { name },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found in MongoDB' });
    }

    // Check if the document exists in Elasticsearch
    const esDocument = await client.exists({
      index: 'tickets',
      id: ticket.id.toString(),
    });

    if (!esDocument) {
      // Reindex the document if missing
      await client.index({
        index: 'tickets',
        id: ticket.id.toString(),
        document: { id: ticket.id, name: ticket.name },
      });
    } else {
      // Update the document in Elasticsearch
      await client.update({
        index: 'tickets',
        id: ticket.id.toString(),
        doc: { name },
      });
    }

    res.json(ticket);
  } catch (err) {
    console.error('Error editing ticket:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a ticket
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findOneAndDelete({ id: parseInt(id) });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Delete from Elasticsearch
    const esDocument = await client.exists({
      index: 'tickets',
      id: id.toString(),
    });

    if (esDocument) {
      await client.delete({
        index: 'tickets',
        id: id.toString(),
      });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
