import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@shared-gittix/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { queueGroupName } from './queue-group-name';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    /**
     * Now if an order has been completed and expiration:complete event
     * is emitted after the order is already payed for ..we need to make sure
     * that the order is *not* marked as cancelled!!
     * If we son't put the below check in place , the order will be marked
     * as cancelled no matter what!!! even in the case where order
     * is already payed for!!!
     */

    if (order.status === OrderStatus.Complete) {
      // simply return and msg.ack()
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
      // ticket: null
      /**
         * We are not doing this because if after 
         the order is cancelled , in future if someone wants to know
         who cancelled the order , we can get that information
         only if ticket is not set to null
         */
    });

    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
