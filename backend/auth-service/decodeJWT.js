import jwt from 'jsonwebtoken';

// This is your JWT token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzMzQ3YjNiLWEwMDctNDgzYy04M2M0LWYxNTY5ZDkwZjZmOSIsImlhdCI6MTcwNjAwNjg2MCwiZXhwIjoxNzA2MDEwNDYwfQ.AbpqvQjqBNMhdNffjKdOF20jDfCl9plRlx6R0fXLkII';

// Decode the token
const decodedToken = jwt.decode(token);

// Check if user_id is in the decoded token
if (decodedToken && decodedToken.id) {
  console.log(`user_id in the token is: ${decodedToken.id}`);
} else {
  console.log('user_id is not in the token');
}
