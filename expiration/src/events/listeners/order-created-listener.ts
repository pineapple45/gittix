import { Listener, OrderCreatedEvent, Subjects } from '@shared-gittix/common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job: ', delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay /** We added a hardcoded delay of 10 seconds so as to check
        if the message and console.log message present in expiration-queue will
        be delayed after 10 seconds */,
      }
    );

    msg.ack();
  }
}
