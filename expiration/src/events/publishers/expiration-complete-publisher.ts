import {ExpirationCompleteEvent, Publisher, Subjects} from "@kosta111/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject: ExpirationCompleteEvent["subject"] = Subjects.ExpirationComplete;
}