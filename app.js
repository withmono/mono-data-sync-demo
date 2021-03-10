const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser, verifyWebhook, requireMonoReauthToken } = require('./middleware/authMiddleware');
const controllers = require('./controllers/allControllers');
const moment = require('moment');

const port = process.env.PORT || 8000

require('dotenv').config();

const app = express();

app.locals.getPage = function(page) {
  const page_number = page.split("page=")[1];
    return `?page=${page_number}`
}

app.locals.setCurrency = function(amount) {
  let res = parseFloat(amount)*0.01  // Convert to naira from kobo
  return res.toLocaleString()
}

app.locals.formatTime = function(time) {
  return moment(time).format("DD-MM-YYYY h:mm:ss");
}

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env['DATABASE_URL'];
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => {
  	console.log(`Launched @ port ${port}`);
  	app.listen(port);
  })
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));

app.get('/dashboard', requireAuth, requireMonoReauthToken, controllers.dashboard, (req, res) => res.render('dashboard'));

app.post('/dashboard', controllers.dashboardPost);

app.get('/manualsync', controllers.manualSync);

app.get('/balances', requireAuth, requireMonoReauthToken, controllers.balances, (req, res) => res.render('balances'));

app.get('/transactions', requireAuth, requireMonoReauthToken, controllers.transactions, (req, res) => res.render('transactions'));

app.get('/alltransactions', requireAuth, requireMonoReauthToken, controllers.alltransactions, (req, res) => res.render('alltransactions'));

app.get('/monoReauth', requireAuth, (req, res) => res.render('monoreauth'));

app.post('/monoReauth', controllers.monoReauth);

app.post('/webhook', verifyWebhook, controllers.webhook);


// app.get('/force-refresh', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);