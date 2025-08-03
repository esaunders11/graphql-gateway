const request = require('supertest');

const GATEWAY_URL = 'http://localhost:4000/graphql';

describe('Apollo Gateway Integration', () => {
  test('responds to basic __typename query', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ __typename }' });
    expect(res.status).toBe(200);
    expect(res.body.data.__typename).toBe('Query');
  });

  test('fetches a user', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ user(id: "1") { id name email } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('name');
    expect(res.body.data.user).toHaveProperty('email');
  });

  test('fetches a listing with owner (federation)', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: `
        {
          listing(id: "123") {
            id
            title
            owner {
              id
              name
              email
            }
          }
        }
      `});
    expect(res.status).toBe(200);
    expect(res.body.data.listing).toHaveProperty('id');
    expect(res.body.data.listing.owner).toHaveProperty('id');
  });

  test('fetches a message with sender and recipient', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: `
        {
          message(id: "abc") {
            id
            text
            sender { id name }
            recipient { id name }
          }
        }
      ` });
    expect(res.status).toBe(200);
    expect(res.body.data.message).toHaveProperty('id');
    expect(res.body.data.message.sender).toHaveProperty('id');
    expect(res.body.data.message.recipient).toHaveProperty('id');
  });

  test('returns null for non-existent user', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ user(id: "doesnotexist") { id name email } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeNull();
  });

});