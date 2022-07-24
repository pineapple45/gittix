import { Publisher, OrderCreatedEvent, Subjects } from '@shared-gittix/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
