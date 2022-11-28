const express = require('express');
const app = express();
const port = process.env.PORT || '5000';
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors')
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send("car leader server working")
})



const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DB_PASSWORD}@cluster0.2sdc0k9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const carCategoryCollection = client.db('carLeader').collection('carCategory')
    const resellCarCollection = client.db('carLeader').collection('resellCar')
    const usersCollection = client.db('carLeader').collection('users')
    const bookingCollection = client.db('carLeader').collection('booking')

    function verifyJWT(req, res, next) {
        const authHeaders = req.headers.authorization;
        if (!authHeaders) {
            res.status(401).send('unauthorized access')
        }
        const token = authHeaders.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
            if (err) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            req.decoded = decoded;
            next();
        })

    }

    try {
        app.get('/categorey', async (req, res) => {
            const query = {}
            const category = await carCategoryCollection.find(query).toArray()
            res.send(category)
        })
        app.get('/categorey/:id', async (req, res) => {
            const categoreyId = req.params.id;
            const query = { categoreyId: categoreyId }
            const categoreyCar = await resellCarCollection.find(query).toArray()
            res.send(categoreyCar)
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(401).send({ accessToken: '' })

        })

        app.get('/booking', verifyJWT, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: "forbidden access" })
            }
            const query = { email }
            const booking = await bookingCollection.find(query).toArray()
            res.send(booking)
        })

        app.get('/myproduct', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myproduct = await resellCarCollection.find(query).toArray();
            res.send(myproduct)
        })


        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users)
            res.send(result)
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })

        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await resellCarCollection.insertOne(product)
            res.send(result)
        })

        app.delete('myproduct', async (req, res) => {

        })

    }

    finally {

    }

}

run().catch(error => console.log(error))



app.listen(port, () => console.log(`car leder server working ${port}`));
