const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schema and model
const DataSchema = new mongoose.Schema({ features: Array, labels: Array });
const Dataset = mongoose.model('Dataset', DataSchema);

// Example data to insert
const exampleData = [
    { features: [0.1, 0.2, 0.3], labels: [1] },
    { features: [0.4, 0.5, 0.6], labels: [0] },
    { features: [0.7, 0.8, 0.9], labels: [1] }
];

// Insert data into the database
Dataset.insertMany(exampleData)
    .then(() => {
        console.log('Data seeded successfully');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error seeding data:', err);
        mongoose.disconnect();
    });
