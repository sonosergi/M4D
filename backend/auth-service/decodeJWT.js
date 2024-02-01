import jwt from 'jsonwebtoken';

// This is your JWT token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc0NGU4ZDBhLTVhN2YtNDI5ZC1iZDdjLWZjN2NhNWZhMmE4YyIsImlhdCI6MTcwNjcwODYwOCwiZXhwIjoxNzA2NzEyMjA4fQ.V7TH-crf23niSAH6c-ovmRv9XqQ7xSwxocD1pRKX_aU';

// Decode the token
const decodedToken = jwt.decode(token);

// Check if user_id is in the decoded token
if (decodedToken && decodedToken.id) {
  console.log(`user_id in the token is: ${decodedToken.id}`);
} else {
  console.log('user_id is not in the token');
}
