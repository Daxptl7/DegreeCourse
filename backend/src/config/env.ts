//Dotenv : Dotenv is a module that loads environment variables from a .env file into process.env.

import dotenv from 'dotenv';



//Config : Config is an object that contains the configuration for the application.
dotenv.config();

/* 

workflow:
1️⃣ Looks for a file named .env in your project root
2️⃣ Reads key–value pairs from it
3️⃣ Loads them into Node’s global object: process.env

*/

export const config = {

  mongodb: {
    //process is the keyword that exists in the node.js and it is used to access the environment variables.
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unilearn'

    /* 
    comparison between the node app and the database:process and connection propertices 
    Node App
    └── process
      ├── env
      ├── pid
      ├── platform
      ├── exit()
      ├── uptime()
      └── argv

    Database
    └── conn
          └── connection
              ├── host
              ├── port
              └── readyState

    
    */
  },

  //JWT : JWT is a JSON Web Token that is used to authenticate the user.

  /*

    JWT (✅ modern solution)

    -> User logs in.
    -> Server gives a token.
    -> Client sends token with every request.
    -> Server verifies, doesn’t store session.


  */
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  server: {
    port: process.env.PORT || 5001,
    env: process.env.NODE_ENV || 'development'
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
};
