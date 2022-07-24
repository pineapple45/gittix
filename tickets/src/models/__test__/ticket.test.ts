import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two seperate changes to the tickets we fetched
  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save(); // this works fine because firstInstance increments
  // version to 1 of document in database

  // save the second fetched ticket
  try {
    await secondInstance!.save(); // test should fail at this because
    // secondInstance is still at the orignal version
    // of 0 while the document version has moved on to
    // version 1 because of the firstInstance
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('incremments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
