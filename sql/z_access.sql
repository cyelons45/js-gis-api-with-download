GRANT CONNECT ON DATABASE gmpsps TO eppackageapi;
GRANT USAGE ON SCHEMA PSPS TO eppackageapi;

--Grant access on Table
GRANT ALL ON TABLE psps.eppackagejobinfo TO psps WITH GRANT OPTION;
GRANT ALL ON TABLE psps.eppackagejobinfo TO superadmin WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE psps.eppackagejobinfo TO eppackageapi;
GRANT SELECT, INSERT, UPDATE,DELETE ON TABLE psps.eppackagejobinfo TO pspsbatch;
GRANT SELECT ON TABLE psps.versioninfo TO eppackageapi;
GRANT SELECT ON TABLE psps.eventinfo TO eppackageapi;
GRANT SELECT ON TABLE psps.eppackagejobinfo TO palantir_ro;


--Grant Execution on Function
GRANT EXECUTE ON FUNCTION psps.api_createeppackagejob_v1(json) TO psps;
GRANT EXECUTE ON FUNCTION psps.api_createeppackagejob_v1(json) TO eppackageapi;

GRANT EXECUTE ON FUNCTION psps.api_updateeppackagejob_v1(json) TO psps;
GRANT EXECUTE ON FUNCTION psps.api_updateeppackagejob_v1(json) TO eppackageapi;

GRANT EXECUTE ON FUNCTION psps.api_eppackagejobstatus_v1(json) TO psps;
GRANT EXECUTE ON FUNCTION psps.api_eppackagejobstatus_v1(json) TO eppackageapi;