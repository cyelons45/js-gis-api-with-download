-- Rollback scripts for PV-354

-- Drop Sequence
DROP SEQUENCE IF EXISTS psps.eppackagejobinfo_jobid_seq;
   
-- Drop Table
DROP TABLE IF EXISTS psps.eppackagejobinfo;