import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.send('Login attempt logged');
});

app.post('/partners', (req, res) => {
  const { name, email, password, company_name } = req.body;
  res.send('Partner registration logged');
});

app.post('/customers', (req, res) => {
  const { name, email, password, address, phone } = req.body;
  res.send('Customer registration logged');
});

app.post('/partners/events', (req, res) => {
  const { name, description, date, location } = req.body;
  res.send('Event creation logged');
});

app.get('/partners/events', (req, res) => {
});

app.get('/partners/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  console.log(`Event ID requested: ${eventId}`);
  res.send('Event details logged');
});

app.post('/events', (req, res) => {
  const { name, description, date, location } = req.body;
  res.send('Event creation logged');
});

app.get('/events', (req, res) => {
});

app.get('/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  console.log(`Event ID requested: ${eventId}`);
  res.send('Event details logged');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});