-- Create Sequence
CREATE SEQUENCE IF NOT EXISTS psps.eppackagejobinfo_jobid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE psps.eppackagejobinfo_jobid_seq
    OWNER TO psps;

GRANT ALL ON SEQUENCE psps.eppackagejobinfo_jobid_seq TO psps;
GRANT ALL ON SEQUENCE psps.eppackagejobinfo_jobid_seq TO eppackageapi;
GRANT ALL ON SEQUENCE psps.eppackagejobinfo_jobid_seq TO pspsbatch;

-- Create Table
CREATE TABLE IF NOT EXISTS  psps.eppackagejobinfo
(
    
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS jobid bigint NOT NULL DEFAULT nextval('eppackagejobinfo_jobid_seq':: regclass);
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS versionid integer[];
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS eventid bigint;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS eventname text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS reporttype text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS fileid text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS status text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS code text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS message text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS outputfilepath text COLLATE pg_catalog."default";
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS lastupdateddate timestamp without time zone;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS jobstarttime timestamp without time zone;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS jobendtime timestamp without time zone;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS trial bigint;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS parentid bigint;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS isparent boolean DEFAULT true;
 ALTER TABLE psps.eppackagejobinfo ADD COLUMN IF NOT EXISTS lastversionupdatedon timestamp without time zone;

ALTER TABLE psps.eppackagejobinfo OWNER to psps;