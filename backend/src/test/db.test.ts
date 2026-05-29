import mongoose from 'mongoose';
import { connectDB } from './db.js'; // Adjust this path to match your filename
import { config } from './env.js';

// 1. Mock the dependencies
jest.mock('mongoose');

// Mock your environment config so we have a reliable dummy URI to test with
jest.mock('./env.js', () => ({
  config: {
    mongodb: {
      uri: 'mongodb://mock-uri:27017/testdb'
    }
  }
}));

describe('Database Connection (connectDB)', () => {
  let consoleLogMock;
  let consoleErrorMock;
  let processExitMock;

  beforeEach(() => {
    // Clear all previous mock data before each test
    jest.clearAllMocks();

    // 2. Spy on console and process.exit
    // We mock these to prevent actual logging in our test terminal
    // and to prevent process.exit from actually killing our test runner!
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up our spies after each test finishes
    jest.restoreAllMocks();
  });

  it('should connect to MongoDB successfully and log the host', async () => {
    // Arrange: Tell our fake mongoose to resolve successfully
    const mockConnection = { connection: { host: 'localhost' } };
    mongoose.connect.mockResolvedValueOnce(mockConnection);

    // Act: Call your function
    await connectDB();

    // Assert: Check if your function did what it was supposed to do
    expect(mongoose.connect).toHaveBeenCalledWith(config.mongodb.uri);
    expect(consoleLogMock).toHaveBeenCalledWith('MongoDB Host: localhost');
    
    // Ensure we didn't accidentally crash the app
    expect(consoleErrorMock).not.toHaveBeenCalled();
    expect(processExitMock).not.toHaveBeenCalled();
  });

  it('should log an error and exit the process if the connection fails', async () => {
    // Arrange: Tell our fake mongoose to throw an error
    const mockError = new Error('Database connection failed');
    mongoose.connect.mockRejectedValueOnce(mockError);

    // Act: Call your function
    await connectDB();

    // Assert: Check if your error handling logic triggered correctly
    expect(mongoose.connect).toHaveBeenCalledWith(config.mongodb.uri);
    expect(consoleErrorMock).toHaveBeenCalledWith('Error: Database connection failed');
    expect(processExitMock).toHaveBeenCalledWith(1);
    
    // Ensure we didn't log a success message
    expect(consoleLogMock).not.toHaveBeenCalled();
  });
});