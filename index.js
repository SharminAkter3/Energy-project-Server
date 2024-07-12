const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());  // to get data from backend 
app.use(express.json()); // to get req body 


// MongoDB URI
const uri = "mongodb+srv://energy-project:PG8XEHazmX5BAZDV@cluster0.kkn2zyc.mongodb.net/?appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        const productCollection = client.db('productsDB').collection('products');

        // Create a new product
        app.post('/products', async (req, res) => {
            const product = req.body;
            try {
                const result = await productCollection.insertOne(product);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error saving product:', error);
                res.status(500).send({ message: 'Error saving product', error });
            }
        });

        // Get all products
        app.get('/products', async (req, res) => {
            try {
                const cursor = productCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send({ message: 'Error fetching products', error });
            }
        });

        // Get a single product by ID
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            try {
                const result = await productCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).send({ message: 'Error fetching product', error });
            }
        });

        // Update a product by ID
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProduct = {
                $set: product
            };
            try {
                const result = await productCollection.updateOne(filter, updatedProduct, options);
                res.send(result);
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).send({ message: 'Error updating product', error });
            }
        });

        // Delete a product by ID
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            try {
                const result = await productCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error('Error deleting product:', error);
                res.status(500).send({ message: 'Error deleting product', error });
            }
        });

    } finally {
        // No closing of client connection
    }
}
run().catch(console.log);

app.get('/', (req, res) => {
    res.send('Energy project server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
