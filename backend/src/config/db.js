import mongoose from 'mongoose';
import { config } from './env.js';
import dns from 'dns';

// Fix for DNS resolution issues
//This is the google ip address computer does not know how to find the ip address of the mongodb
//So we are telling it to use the google ip address to find the ip address of the mongodb
//This is a temporary fix for the DNS resolution issues.


try {
  dns.setServers(['8.8.8.8']);//This is Google's DNS server
} catch (error) {
  console.error('Could not set DNS servers:', error);
}

//Export : export: Makes this function available to be used in other files
//Async : async: Allows us to use the await keyword in the function
//Await : await: Pauses the execution of the function until the promise is resolved
//Promise : Promise: An object that represents the eventual completion or failure of an asynchronous operation


export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);//mongoose.connect(config.mongodb.uri) This will return the promise.we use the Await function to wait for the promise to be resolved.and work excute the code parallelly .JS pauses this function.//Node continues running other code//When MongoDB responds → Promise resolves//conn gets the actual connection object.
  //conn return the mongoose connection object. .connection is the property of the mongoose connection in which it includes terms like port:which return the port mongobd is using and host:which return the host name of the mongodb.for example :mongodb://localhost:27017/unilearn  
    console.log(`MongoDB Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
