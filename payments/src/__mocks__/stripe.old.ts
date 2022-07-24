export const stripe = {
  charges: {
    /**Contrary to mockImplementation function which we used in
     * nats-wrapper we use mockResolvedValue()
     * here because we need to return a promise rather than a direct value
     */
    create: jest.fn().mockResolvedValue({}),
  },
};
