require('dotenv').config();
const express = require('express');

const app = express();
// Parse incoming JSON requests and make data available in req.body
app.use(express.json());
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));
const postSuggestionRoutes = require('./routes/postSuggestion')

app.use('/api',postSuggestionRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
