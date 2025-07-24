import express from 'express';
import { Router } from 'next/router';
// import router from 'Router';
const sendWhatsappMessage = require('../twilioService');

Router.post('/send-whatsapp', async (req, res) => {
    const { phone, message } = req.body;

    try {
        await sendWhatsappMessage(phone, message);
        res.json({ success: true, message: 'WhatsApp message sent successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = Router;
