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

  test('fetches currentUser', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ currentUser { id username email } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.currentUser).toHaveProperty('id');
  });

  test('fetches getUser', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ getUser(id: "15") { id firstName email } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.getUser).toHaveProperty('id');
  });

  test('fetches getListing', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ getListing(id: "1") { id title description } }' });
    expect(res.status).toBe(200);
    expect(res.body.data.getListing).toHaveProperty('id');
  });

  test('searchListings returns an array', async () => {
    const res = await request(GATEWAY_URL)
      .post('')
      .send({ query: '{ searchListings(query: "apartment") { id title } }' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.searchListings)).toBe(true);
  });

});
