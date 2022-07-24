import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@shared-gittix/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asdfdf',
    // orderId: new mongoose.Types.ObjectId().toHexString() // This gives error
    // because we have no property of *orderId* in ticket model
    // But we basically want to simulate a ticket with order
    // just for testing purposes
  });

  ticket.set({ orderId }); // simple way to set a property not specified
  // in Ticket mongoose model. Instead of changing the model we
  // make this simple chnage for testing purposes!!!
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

// condensing all tests into one
it('updates the ticket, publishes an event and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
