-- Speed up admin outgoing list (direction + issuedAt/documentNumber/createdAt DESC)
-- and the public documents list (isPublic + issuedAt DESC).
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'official_documents_direction_issuedAt_documentNumber_createdAt_idx'
    AND object_id = OBJECT_ID(N'dbo.official_documents')
)
BEGIN
  CREATE NONCLUSTERED INDEX [official_documents_direction_issuedAt_documentNumber_createdAt_idx]
  ON [dbo].[official_documents]([direction], [issuedAt] DESC, [documentNumber] DESC, [createdAt] DESC);
END

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'official_documents_isPublic_issuedAt_idx'
    AND object_id = OBJECT_ID(N'dbo.official_documents')
)
BEGIN
  CREATE NONCLUSTERED INDEX [official_documents_isPublic_issuedAt_idx]
  ON [dbo].[official_documents]([isPublic], [issuedAt] DESC);
END
