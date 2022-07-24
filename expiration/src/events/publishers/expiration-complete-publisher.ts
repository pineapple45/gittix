import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@shared-gittix/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
