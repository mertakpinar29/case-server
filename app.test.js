import request from "supertest";
import app from "./app.js";

let server = null;

beforeAll(() => {
  server = app.listen(5000, () => {
    console.log("Testing on port 5000");
  });
});

afterAll(async () => {
  console.log("Tests are done, closing the server.");
  await server.close();
});

describe("TESTS", () => {
  describe("POST /create-session", () => {
    describe("Customer identification with email in checkout process", () => {
      // should check if customer with given email exists in Stripe
      // if there exists a customer with given email, customer's id should be used for checkout session
      // there shouldn't be multiple custommer accounts with same email in Stripe
      // customer property of session object is null, if customer does not exist
      test("Existing customer test", async () => {
        const response = await request(app)
          .post("/create-session")
          .expect("Content-Type", /json/)
          .send({
            amount: 2000,
            currency: "usd",
            quantity: 1,
            itemName: "Test Product",
            email: "mert@gmail.com",
          });

        expect(response.body.session.customer).not.toBe(null);
      });

      test("Non-existing customer test", async () => {
        const response = await request(app)
          .post("/create-session")
          .expect("Content-Type", /json/)
          .send({
            amount: 2000,
            currency: "usd",
            quantity: 1,
            itemName: "Test Product",
            email: "notmert@gmail.com",
          });

        expect(response.body.session.customer).toBe(null);
      });
    });
  });

  describe("GET /payment-success/:sessionId", () => {
    describe("Duplicate record creation after checkout", () => {
      // If checkout process is successful, user will be redirected to homepage and client application
      // automatically makes a GET request to inform our web service that, checkout was successful.
      // When informed, web service creates a Payment document in database.
      // User may make multiple requests to same URL, there must not be multiple records for same checkout.
      test("Making payment-success request with already issued checkout", (done) => {
        const issued_checkout =
          "cs_test_a1RS4hAkI18SG30uVSDB17BHBlOXleSk3ti3pxYY3xUOuv5cmYGphy5Lhk";
        request(app)
          .get("/payment-success/" + issued_checkout)
          // normally server responds with 201 status code after creating the document in database
          .expect(400);
        done();
      });
    });
  });
});
