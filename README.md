# Mono-Connect API Implementation

## Quick Links

[1. Overview](#1-overview) 

[2. Implementation](#2-implementation) 

[3. Installation](#3-installation)  


## 1. Overview  

Project #sweet-loans [(link)](https://sweet-loans.herokuapp.com/) is a simple web application that allows its users to connect their financial account, see their information, transactions, balances and also fetch real time data that happens on their financial account.  
It is built with NodeJS Express, which basically implements the core features of the Mono-Connect [API](https://docs.mono.co/reference).

### Walkthrough <br />
1. The web application has a basic authentication system, where a user can [Login](https://sweet-loans.herokuapp.com/login), [Signup](https://sweet-loans.herokuapp.com/signup) and Logout of the system. <br />
2. Once signed in, a user is faced with a dashboard where he has to link his account through the mono widget. <br />
3. On successful linkup, the page forces reload and fetches all the user's connected information right on the dashboard.<br />
4. Also from the side navigation, a user can view his account balance, his recent transaction history, and then all transaction histories with pagination.<br />
5. Lastly, you can force refresh by Data syncing manually on the Balances page. <br />

## 2. Implementation  
1. Firstly, the application has Mono's widget [embedded](https://github.com/kingkenway/mono/blob/master/views/partials/mono_dialog.ejs#L1), for users to connect their bank account. Once successful, the application retrieves a <b>code</b>  sent by Mono.  <br />

2. After user has his/her account connected successfully, his <b>Mono ID.</b> is needed which leads to the application making a request with the provided code in 1, to Mono's Authentication Endpoint -> https://api.withmono.com/account/auth through POST Method [here](https://github.com/kingkenway/mono/blob/master/controllers/allControllers.js#L32) <br />

3. Once the user's <b>Mono ID.</b> is fetched and stored in the db, his connected user information is immediately fetched and loaded on the dashboard through Mono's API Identity Endpoint -> https://api.withmono.com/accounts/id/identity through GET Method right [here](https://github.com/kingkenway/mono/blob/master/controllers/allControllers.js#L8) <br />

4. The user can view his account balance through Mono's API Information Endpoint -> https://api.withmono.com/accounts/id through GET Method right [here](https://github.com/kingkenway/mono/blob/master/controllers/allControllers.js#L69) <br />

5. The user views his recent (last 20) transactions, through Mono's API transaction Endpoint -> https://api.withmono.com/accounts/id/transaction through GET Method right [here](https://github.com/kingkenway/mono/blob/master/controllers/allControllers.js#L92) <br />

6. Also, all transaction history with pagination is viewed, through Mono's API transaction Endpoint -> https://api.withmono.com/accounts/id/transaction?page=1 through GET Method right [here](https://github.com/kingkenway/mono/blob/master/controllers/allControllers.js#L121) <br />

7. Lastly, you can force refresh by Data syncing manually, which can be triggered with the button displayed on the Balances page. 

You can register [here](https://sweet-loans.herokuapp.com/signup) to give this application a shoot.

## 3. Installation

The first thing to do is to clone the repository:

```sh
$ git clone https://github.com/kingkenway/mono.git
$ cd mono
```

## Local Environment Variables
DATABASE_URL='Your Mongo DB URL'  
MONO_SECRET_KEY='Your Mono Secret Key on your dashboard'  
MONO_PUBLIC_KEY='Your Mono Public Key on your dashboard'  
MONO_WEBHOOK_SEC='Your Mono Webhook Secret Key on your dashboard'  
TOKEN='A random key identifier for JWT Verification'

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```javascript
npm start
```