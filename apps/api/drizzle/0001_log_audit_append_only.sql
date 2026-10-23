-- Log audit append-only (KB-044): UPDATE, DELETE, dan TRUNCATE ditolak oleh basis data.
CREATE OR REPLACE FUNCTION tolak_ubah_log_audit() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'log_audit bersifat append-only: % ditolak', TG_OP USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER log_audit_tolak_ubah
  BEFORE UPDATE OR DELETE ON "log_audit"
  FOR EACH ROW EXECUTE FUNCTION tolak_ubah_log_audit();--> statement-breakpoint
CREATE TRIGGER log_audit_tolak_truncate
  BEFORE TRUNCATE ON "log_audit"
  FOR EACH STATEMENT EXECUTE FUNCTION tolak_ubah_log_audit();
