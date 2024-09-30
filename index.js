const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Address = require("./models/Address");

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form from the 'public' directory
app.use(express.static("public"));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/smoketrees_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// POST route to handle form submission
app.post("/register", async (req, res) => {
  const { name, address } = req.body;

  // Log form data for debugging
  console.log("Form Data:", req.body);

  try {
    // Check if both name and address are provided
    if (!name || !address) {
      return res.status(400).send("Name and address are required");
    }

    // Create and save the user first
    const newUser = new User({ name });
    await newUser.save();
    console.log("User saved:", newUser); // Debugging line

    // Create the address, associate the userId, and save the address
    const newAddress = new Address({
      userId: newUser._id, // Associate the userId with the address
      address,
    });
    await newAddress.save();
    console.log("Address saved:", newAddress); // Debugging line

    // Update the user's addresses field to include this address
    newUser.addresses.push(newAddress._id);
    await newUser.save();
    console.log("User updated with address:", newUser); // Debugging line

    res.status(201).send("User and address saved successfully!");
  } catch (error) {
    console.error("Error details:", error); // Log the actual error details
    res.status(500).send("Error saving data");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
