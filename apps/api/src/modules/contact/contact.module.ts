import { Module } from "@nestjs/common";
import { ContactMessagesController } from "./contact-messages.controller";
import { AdminContactMessagesController } from "./admin-contact-messages.controller";
import { ContactMessagesService } from "./contact-messages.service";

@Module({
  controllers: [ContactMessagesController, AdminContactMessagesController],
  providers: [ContactMessagesService]
})
export class ContactModule {}
