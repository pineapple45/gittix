import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@shared-gittix/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
