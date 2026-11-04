ALTER TABLE [dbo].[legal_exams] ADD [requireEntryCode] BIT NOT NULL CONSTRAINT [legal_exams_requireEntryCode_df] DEFAULT 0;

CREATE TABLE [dbo].[legal_exam_entry_codes] (
    [id] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [codeHash] NVARCHAR(1000) NOT NULL,
    [sentAt] DATETIME2 NOT NULL CONSTRAINT [legal_exam_entry_codes_sentAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [legal_exam_entry_codes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [legal_exam_entry_codes_examId_userId_key] UNIQUE NONCLUSTERED ([examId],[userId])
);

CREATE NONCLUSTERED INDEX [legal_exam_entry_codes_userId_idx] ON [dbo].[legal_exam_entry_codes]([userId]);

ALTER TABLE [dbo].[legal_exam_entry_codes] ADD CONSTRAINT [legal_exam_entry_codes_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[legal_exams]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[legal_exam_entry_codes] ADD CONSTRAINT [legal_exam_entry_codes_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
