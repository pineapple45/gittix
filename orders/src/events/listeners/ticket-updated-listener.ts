import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@shared-gittix/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // const ticket = await Ticket.findById(data.id);
    const ticket = await Ticket.findByEvent(data); // Now we need to find a ticket based on not only id but also matching version

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { price, title } = data;
    ticket.set({ title, price });
    await ticket.save();
    msg.ack();
  }
}
