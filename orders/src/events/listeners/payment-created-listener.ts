import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@shared-gittix/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    /**Note above we update an order and we don't send an orderUpdated Event...
     * This is because once order is completed..it is in the final state!!
     * No order updates will be done after this...so we tecnically don't
     * need to send an order updated event!!!
     * But to mantain consistency we should do this in real projects
     * as this will not break anything but only help with concurency
     * issuess... But in this case scenerio we don't need to
     */
    msg.ack();
  }
}
