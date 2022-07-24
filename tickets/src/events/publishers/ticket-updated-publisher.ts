import { Publisher, TicketUpdatedEvent, Subjects } from '@shared-gittix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
