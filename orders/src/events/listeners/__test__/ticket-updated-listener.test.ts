import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@shared-gittix/common';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });

  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 999,
    userId: 'dsfsjdf87jkhsdf',
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(), // we provide a mock function here
  };

  // return all of this stuff
  return { listener, ticket, data, msg };
};

it('finds, updates and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a ticket was created!
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is in the future', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;

  // call the onMessage function with the data object + message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {} // we leave it empty because we don't want our test
  // to throw errors and want the test to successfully fail
  // by just movin to expect statement below
  // write assertions to make sure a ticket was created!
  expect(msg.ack).not.toHaveBeenCalled();
});
