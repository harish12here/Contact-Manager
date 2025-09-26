const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Contact = require('../Models/Contact');

// Create a new contact
router.post('/', async (req, res) => {
    const { name, email, phone, address,userId } = req.body;
    try {
        const newContact = new Contact({ name, email, phone, address , userId});
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all contacts
router.get('/user/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const contacts = await Contact.find({userId:id});
        res.status(200).json(contacts);
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ message: error.message });
    }
});

// Get a contact by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a contact
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        const updatedContact = await Contact.findByIdAndUpdate(id, { name, email, phone, address }, { new: true });
        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        return res.status(200).json(updatedContact);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
