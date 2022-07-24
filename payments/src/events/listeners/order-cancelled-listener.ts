import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@shared-gittix/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    /**
     * We don't really need the version field to find a specific order
     * whenerver and *order:cancelled* event is published!! We are not
     * versioning orders technically since there is no need for it
     * currently! We are only making creating and cancelling an order
     * and not *updating* the order currently in any way!!!
     * Because we were updating tickets as an intermediate step,
     * we needed that version flag to make sure all ticket related events
     * are processed properly!! Here we don't...but still on considering
     * future application aspects , we should use findByEvent and use the
     * version property anyway!! Who knows Maybe in future we will be
     * updating orders too!!
     */
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
