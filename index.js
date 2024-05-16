const mongoose = require('mongoose');
const tf = require('@tensorflow/tfjs-node');

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schema and model
const DataSchema = new mongoose.Schema({ features: Array, labels: Array });
const Dataset = mongoose.model('Dataset', DataSchema);

Dataset.find().then(data => {
    if (data.length === 0) {
        console.log("No data found in the database.");
        return;
    }

    const features = data.map(d => tf.tensor(d.features));
    const labels = data.map(d => tf.tensor(d.labels));

    if (features.length === 0 || !features[0]) {
        console.log("Features array is empty or undefined.");
        return;
    }

    // Proceed with tensors in TensorFlow.js
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [features[0].shape[0]], units: 50, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'sgd', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    // Prepare data for training
    const xs = tf.stack(features);
    const ys = tf.stack(labels);

    // Train the model
    model.fit(xs, ys, {
        epochs: 10,
        callbacks: {
            onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc}`)
        }
    })
    async function evaluateModel(model, xs, ys) {
        const evalResult = model.evaluate(xs, ys);
        const loss = await evalResult[0].data();
        const accuracy = await evalResult[1].data();
        console.log(`Evaluation Results - Loss: ${loss}, Accuracy: ${accuracy}`);
    } 
    evaluateModel(model, xs, ys);
});

