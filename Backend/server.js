require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Queue = require('./models/Queue');
const Contact = require('./models/Contact');
const nodemailer = require('nodemailer');
const Testimonial = require('./models/Testimonial');
const Visitor = require('./models/Visitor');
const multer = require('multer');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
app.use('/uploads', express.static('uploads'));
// ==========================================
// UNIQUE VISITOR
// ==========================================

app.post('/api/visitor', async (req, res) => {

    try {

        const { visitorId } = req.body;

        if (!visitorId) {
            return res.status(400).json({
                message: 'Visitor ID is required'
            });
        }

        // Check whether this visitor already exists
        const existingVisitor =
            await Visitor.findOne({ visitorId });

        // New visitor
        if (!existingVisitor) {

            await Visitor.create({
                visitorId
            });
        }

        // Get total unique visitors
        const totalVisitors =
            await Visitor.countDocuments();

        res.status(200).json({
            success: true,
            totalVisitors
        });

    } catch (error) {

        console.error(
            'Visitor error:',
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// ==========================================
// TESTIMONIAL PHOTO UPLOAD
// ==========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + file.originalname;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WebP images are allowed'));
        }
    }
});
// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
app.get('/', (req, res) => {
    res.send('AI Queue Management System Backend');
});
app.post('/api/contact', async (req, res) => {

    try {

        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const newMessage = new Contact({
            name,
            email,
            message
        });

        const savedMessage = await newMessage.save();
    await transporter.sendMail({
    from: `"AI Queue Management System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Contact Message from ${name}`,

    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `
});

        res.status(201).json({
            success: true,
            message: 'Message received successfully',
            data: savedMessage
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// ==========================================
// ADMIN LOGIN
// ==========================================

app.post('/api/admin/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        // Temporary admin credentials
        // Later we will move these to .env
        if (
            username === "Developer" &&
            password === "Developer456"
        ) {

            return res.status(200).json({
                success: true,
                message: "Login successful"
            });

        }

        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});
// ==========================================
// CREATE NEW CUSTOMER / GENERATE TOKEN
// ==========================================
app.post('/api/queue', async (req, res) => {
    try {

        // Customer se sirf naam aur service lenge
        // Token number backend khud generate karega
        const { customerName, service } = req.body;

        // Database se sabse bada existing token number find karo
        const lastCustomer = await Queue.findOne()
            .sort({ tokenNumber: -1 });

        // Agar queue empty hai to token 101 se start hoga
        // Otherwise last token + 1 generate hoga
        const nextToken = lastCustomer
            ? lastCustomer.tokenNumber + 1
            : 101;

        // New customer create karo
        const newCustomer = new Queue({
            tokenNumber: nextToken,
            customerName,
            service
        });

        // Customer ko MongoDB mein save karo
        const savedCustomer = await newCustomer.save();


        // Generated token ke saath customer details return karo
        res.status(201).json(savedCustomer);

    } catch (error) {

        // Database/server error handle karo
        res.status(500).json({
            message: error.message
        });
    }
});
app.get('/api/queue', async (req, res) => {
    try {
        const queue = await Queue.find().sort({ createdAt: 1 });

        res.status(200).json(queue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ==========================================
// CREATE TESTIMONIAL
// ==========================================

// ==========================================
// CREATE TESTIMONIAL WITH OPTIONAL PHOTO
// ==========================================

app.post(
    '/api/testimonials',
    upload.single('photo'),
    async (req, res) => {

        try {

            const { name, rating, feedback } = req.body;

            // Required fields
            if (!name || !rating || !feedback) {
                return res.status(400).json({
                    message:
                        'Name, rating and feedback are required'
                });
            }

            // Photo is optional
            const photo = req.file
                ? `/uploads/${req.file.filename}`
                : null;

            const newTestimonial = new Testimonial({
                name,
                rating: Number(rating),
                feedback,
                photo
            });

            const savedTestimonial =
                await newTestimonial.save();

            res.status(201).json({
                success: true,
                message:
                    'Testimonial submitted successfully',
                data: savedTestimonial
            });

        } catch (error) {

            console.error(
                'Testimonial error:',
                error
            );

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }
);
// ==========================================
// GET APPROVED TESTIMONIALS
// ==========================================

app.get('/api/testimonials/approved', async (req, res) => {

    try {

        const testimonials = await Testimonial.find({
            status: 'approved'
        }).sort({ createdAt: -1 });

        res.status(200).json(testimonials);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// ==========================================
// GET PENDING TESTIMONIALS
// ==========================================

app.get('/api/testimonials/pending', async (req, res) => {

    try {

        const testimonials = await Testimonial.find({
            status: 'pending'
        }).sort({ createdAt: -1 });

        res.status(200).json(testimonials);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// ==========================================
// APPROVE TESTIMONIAL
// ==========================================

app.patch('/api/testimonials/:id/approve', async (req, res) => {

    try {

        const testimonial =
            await Testimonial.findByIdAndUpdate(
                req.params.id,
                { status: 'approved' },
                { new: true }
            );

        if (!testimonial) {
            return res.status(404).json({
                message: 'Testimonial not found'
            });
        }

        res.status(200).json(testimonial);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// ==========================================
// UNAPPROVE TESTIMONIAL
// ==========================================

app.patch("/api/testimonials/:id/unapprove", async (req, res) => {

    try {

       const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { status: 'pending' },
    { new: true }
);
        if (!testimonial) {
            return res.status(404).json({
                message: "Testimonial not found"
            });
        }

        res.json(testimonial);

    } catch (error) {

        console.error("Unapprove testimonial error:", error);

        res.status(500).json({
            message: "Unable to unapprove testimonial"
        });
    }
});
// ==========================================
// NEXT CUSTOMER ROUTE
// Finds the first waiting customer and starts serving them
// ==========================================

app.patch('/api/queue/next', async (req, res) => {
    try {

        // Find the oldest customer whose status is "waiting"
        const nextCustomer = await Queue.findOneAndUpdate(
            { status: 'waiting' },

            // Change their status from waiting to serving
            { status: 'serving' },

            // Return the updated customer
            {
                new: true,
                sort: { createdAt: 1 }
            }
        );

        // If there are no waiting customers
        if (!nextCustomer) {
            return res.status(404).json({
                message: 'No customers are waiting'
            });
        }

        // Send the customer who is now being served
        res.status(200).json(nextCustomer);

    } catch (error) {

        // Handle any database/server error
        res.status(500).json({
            message: error.message
        });
    }
});
// Update a customer's status in the queue
// Example: waiting -> serving
app.patch('/api/queue/:id', async (req, res) => {
    try {

        // Find the customer using their MongoDB ID
        // and change their status to "serving"
        const customer = await Queue.findByIdAndUpdate(
            req.params.id,
            { status: 'serving' },

            // Return the updated customer after the update
            { new: true }
        );

        // If the given customer ID doesn't exist
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        // Send the updated customer details to the client
        res.status(200).json(customer);

    } catch (error) {

        // Handle any server/database error
        res.status(500).json({
            message: error.message
        });
    }
});
// ==========================================
// COMPLETE CUSTOMER ROUTE
// Marks a customer as completed after service
// ==========================================

app.patch('/api/queue/:id/complete', async (req, res) => {
    try {

        // Find the customer using their MongoDB ID
        // and change their status to "completed"
        const customer = await Queue.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },

            // Return the updated customer
            { new: true }
        );

        // If the customer ID does not exist
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        // Send the completed customer details back
        res.status(200).json(customer);

    } catch (error) {

        // Handle any database/server error
        res.status(500).json({
            message: error.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
