-- Admin user list orders by createdAt DESC and only shows one page.
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'users_createdAt_idx'
    AND object_id = OBJECT_ID(N'dbo.users')
)
BEGIN
  CREATE NONCLUSTERED INDEX [users_createdAt_idx]
  ON [dbo].[users]([createdAt] DESC);
END
