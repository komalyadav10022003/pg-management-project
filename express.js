const express = require("express");
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());

// Home route only
app.get('/', (req, res) => {
  console.log("Home route accessed",req.url,req.method);
  res.send('<p>Welcome to India today</p>');
});

// Form route
app.get('/submit-details', (req, res) => {
  console.log("Submit your details here...");
  res.send(`
    <html>
      <head><title>Submit the details</title></head>
      <body>
        <p>Fill the form and submit your details</p>
        <form method="post" action="/submit">
          <label>
            <input type="text" name="name" placeholder="Enter your name"> Enter your name
          </label><br>
          <label><input type="radio" name="gender" value="male"> Male</label><br>
          <label><input type="radio" name="gender" value="female"> Female</label><br>
          <input type="submit" value="Submit">
        </form>
      </body>
    </html>
  `);
});

// To handle submitted form
app.post('/submit', express.urlencoded({ extended: true }), (req, res) => {
  const { name, gender } = req.body;
  console.log("Form is submitted successfully");
  res.send(`<h2>Thank you, ${name}. Gender: ${gender}</h2>`);
});

app.use((req,res,next)=>{
  res.status(404).send("<h1>Your page is not found</h1>");
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
