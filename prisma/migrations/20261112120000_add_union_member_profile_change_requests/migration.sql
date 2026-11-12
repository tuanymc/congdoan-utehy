-- Yêu cầu đoàn viên tự cập nhật ảnh / chức vụ / trình độ — admin duyệt rồi mới ghi vào danh bạ.
CREATE TABLE [dbo].[union_member_profile_change_requests] (
    [id] NVARCHAR(1000) NOT NULL,
    [memberId] NVARCHAR(1000) NOT NULL,
    [requestedByUserId] NVARCHAR(1000) NOT NULL,
    [photoUrl] NVARCHAR(1000),
    [positionTitle] NVARCHAR(1000),
    [degreeLabel] NVARCHAR(1000),
    [currentPhotoUrl] NVARCHAR(1000),
    [currentPositionTitle] NVARCHAR(1000),
    [currentDegreeLabel] NVARCHAR(1000),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [union_member_profile_change_requests_status_df] DEFAULT 'PENDING',
    [reviewNote] NVARCHAR(MAX),
    [reviewedByUserId] NVARCHAR(1000),
    [reviewedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [union_member_profile_change_requests_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [union_member_profile_change_requests_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE NONCLUSTERED INDEX [union_member_profile_change_requests_memberId_status_idx] ON [dbo].[union_member_profile_change_requests]([memberId], [status]);
CREATE NONCLUSTERED INDEX [union_member_profile_change_requests_status_createdAt_idx] ON [dbo].[union_member_profile_change_requests]([status], [createdAt]);

ALTER TABLE [dbo].[union_member_profile_change_requests] ADD CONSTRAINT [union_member_profile_change_requests_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[union_members]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD CONSTRAINT [union_member_profile_change_requests_requestedByUserId_fkey] FOREIGN KEY ([requestedByUserId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD CONSTRAINT [union_member_profile_change_requests_reviewedByUserId_fkey] FOREIGN KEY ([reviewedByUserId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
