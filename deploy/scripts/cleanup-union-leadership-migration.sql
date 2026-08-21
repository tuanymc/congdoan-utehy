-- Gỡ object dở từ migration 20260821*_add_union_leadership_and_self_service khi UNIQUE trên userId
-- fail (SQL 1505, nhiều NULL) hoặc lần deploy sau báo Invalid column name 'userId' (SQL 207).
-- Chạy: npx prisma db execute --file deploy/scripts/cleanup-union-leadership-migration.sql --schema=prisma/schema.prisma
-- KHÔNG chạy các lệnh ALTER/DROP này trong PowerShell — [tên] bị PowerShell hiểu là type.

IF OBJECT_ID(N'dbo.union_committee_members', N'U') IS NOT NULL
  DROP TABLE [dbo].[union_committee_members];

IF OBJECT_ID(N'dbo.union_terms', N'U') IS NOT NULL
  DROP TABLE [dbo].[union_terms];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'union_members_userId_fkey')
  ALTER TABLE [dbo].[union_members] DROP CONSTRAINT [union_members_userId_fkey];

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = N'union_members_userId_key')
  ALTER TABLE [dbo].[union_members] DROP CONSTRAINT [union_members_userId_key];

IF EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'union_members_userId_key' AND object_id = OBJECT_ID(N'dbo.union_members')
)
  DROP INDEX [union_members_userId_key] ON [dbo].[union_members];

IF EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'union_members_userId_idx' AND object_id = OBJECT_ID(N'dbo.union_members')
)
  DROP INDEX [union_members_userId_idx] ON [dbo].[union_members];

IF COL_LENGTH(N'dbo.union_members', N'userId') IS NOT NULL
  ALTER TABLE [dbo].[union_members] DROP COLUMN [userId];
