require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const showcaseVideoRoutes = require('./routes/showcaseVideoRoutes');
const messageRoutes = require('./routes/messageRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminBlogRoutes = require('./routes/adminBlogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const faqRoutes = require('./routes/faqRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const counterRoutes = require('./routes/counterRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const logoUploadRoutes = require('./routes/logoUploadRoutes');
const adminGalleryRoutes = require('./routes/adminGalleryRoutes');
const teamRoutes = require('./routes/teamRoutes');
const teamUploadRoutes = require('./routes/teamUploadRoutes');
const blogUploadRoutes = require('./routes/blogUploadRoutes');
const adminInvitationRoutes = require('./routes/adminInvitationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');





app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api', messageRoutes);
app.use('/api/products', productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use('/api/showcase-video', showcaseVideoRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logo-upload', logoUploadRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/team-upload', teamUploadRoutes);
app.use('/api/blog-uploads', blogUploadRoutes);
app.use('/api/admin/invitations', adminInvitationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/forms', newsletterRoutes);








app.get("/", (req, res) => {
  res.send("Backend Running");
});app.use('/api/dashboard', dashboardRoutes);app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    company: 'COCOABRIDGE Ltd',
    message: 'COCOABRIDGE API is running',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});