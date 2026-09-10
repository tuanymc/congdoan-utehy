-- AlterTable: lưu lần gửi email phản hồi từ hộp thư Liên hệ
ALTER TABLE [dbo].[contact_messages] ADD [repliedAt] DATETIME2 NULL;
ALTER TABLE [dbo].[contact_messages] ADD [replySubject] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[contact_messages] ADD [replyBody] NVARCHAR(MAX) NULL;

CREATE NONCLUSTERED INDEX [contact_messages_repliedAt_idx] ON [dbo].[contact_messages]([repliedAt]);
