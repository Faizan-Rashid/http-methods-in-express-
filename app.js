import express from "express"
import { products } from "./data.js";

const app = express();

app.use(express.json());


const resolveProductByID = (req, res, next) => {
    try {
        const { params: { id } } = req;

        const parsedId = parseInt(id);
        if (isNaN(parsedId)) return res.status(400).json({ message: "Invalid Id" })

        const productIndex = products.findIndex(product => product.id === parsedId);
        if (productIndex === -1) return res.status(404).json({ message: "product not found" })

        req.productIndex = productIndex;
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const PORT = process.env.POR || 3000;


app.get("/", (req, res) => {
    res.status(201).json({ message: "hello" })
})

// query parameters
app.get("/api/products", (req, res) => {
    try {
        // console.log(req.query);
        const { query: { filter, value } } = req;

        if (filter && value)
            return res.status(200).json({ products: products.filter(product => product[filter] === value) })

        res.status(200).json({ products })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

// route paramaters
app.get("/api/products/:id", resolveProductByID, (req, res) => {
    try {
        const { productIndex } = req;
        const product = products[productIndex];

        if (!product) return res.status(404).json({ message: "Product not found" })
        res.status(200).json({ product })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post("/api/products", (req, res) => {

    try {
        const { body } = req;

        const newProduct = { id: products[products.length - 1].id + 1, ...body };
        products.push(newProduct);

        return res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

// PUT
app.put("/api/products/:id", resolveProductByID, (req, res) => {
    try {
        const { productIndex, body } = req;
        products[productIndex] = { id: products[productIndex].id, ...body };
        res.status(201).json({ product: products[productIndex] })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

app.patch("/api/products/:id", resolveProductByID, (req, res) => {
    try {
        const { productIndex, body } = req;

        products[productIndex] = { ...products[productIndex], ...body };
        res.sendStatus(201);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

app.delete("/api/products/:id", resolveProductByID, (req, res) => {
    try {
        const { productIndex } = req;

        products.splice(productIndex, 1)
        return res.sendStatus(200)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

app.listen(PORT, () => {
    console.log(`app listens on port ${PORT}`)
})