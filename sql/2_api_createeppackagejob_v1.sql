-- FUNCTION: psps.api_createeppackagejob_v1(json)

-- DROP FUNCTION psps.api_createeppackagejob_v1(json);

CREATE OR REPLACE FUNCTION psps.api_createeppackagejob_v1(param_jobrequest_json json)
    RETURNS json
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
AS $BODY$
/**
 * Author: Priyanka Singh p6s6
 * Purpose: To insert records in psps.eppackagejobinfo table
 * @Args(Input): JSON request with versionID,reportType,eventID,eventName,fileID.
 * @returns : JSON object with code, status and message.
 * Created Date: 08-10-2020
 * Story : PV-354
 * Updated By: 
 * Updated On : 
 * version: 1.0
 */

-- declaration for json input local variables 
DECLARE
     json_versionidtxt text;
     json_versionid integer[];
	 json_reporttype text;
	 json_eventid bigint;
	 json_eventname text;
	 json_fileid text;
-- declaration local variables
	 v_jobid bigint = 0;
	 v_versioncount bigint;
	 v_eventidcount bigint;
	 v_arrlen bigint;
	 v_jobqcount bigint;
	 v_lastversionupdatedon timestamp;
	 v_lastupdatedon timestamp;
	 v_jobstatus text;
	 v_versionidarray integer[];
-- Exception variables
     v_state   text;
     v_exception_messsage  text;
     v_detail  text;
     v_hint    text;
     v_context text;
	 v_versionID text;

-- return message 
DECLARE returnMessage json;

BEGIN
	-- Assign values to local variables from input JSON except arrray type
	SELECT
		(param_jobrequest_json->>'reportType')::text,
		(param_jobrequest_json->>'eventID')::text,
		(param_jobrequest_json->>'eventName')::text,
		(param_jobrequest_json->>'fileID')::text
	INTO 
		json_reporttype, json_eventid, json_eventname, json_fileid;

	-- get the values from the array object by calling parse_array_elements another function
	SELECT * FROM psps.parse_array_elements(param_jobrequest_json->>'versionID')
	INTO json_versionidtxt;

	SELECT (string_to_array(json_versionidtxt, ','))::integer[] 
	INTO json_versionid;

	v_arrlen  = COALESCE(array_length(json_versionid, 1), 0);

	-- Check if version exists in versioninfo table.
	SELECT COUNT(1)
	INTO v_versioncount
	FROM PSPS.VERSIONINFO
	WHERE versionid = ANY (json_versionid);

	-- Exit if version not exist in versioninfo table.
	IF (v_versioncount < v_arrlen) THEN
		SELECT json_build_object(
			'code', 'e006',
			'status','Failed',
			'message', 'VersionID(s) does not exist.'
		) INTO returnMessage;
		RETURN returnMessage;
	END IF;

	-- Check if eventid exists in eventinfo table.
	SELECT COUNT(1)
	INTO v_eventidcount
	FROM PSPS.EVENTINFO
	WHERE eventid = json_eventid;

	-- Exit if eventid not exist in eventinfo table.
	IF (v_eventidcount = 0) THEN
		SELECT json_build_object(
			'code', 'e008',
			'status','Failed',
			'message', 'EventID does not exist.'
		) INTO returnMessage;
		RETURN returnMessage;
	END IF;

	-- Check the status of each versionid in Array.
	SELECT COUNT(1)
	INTO v_versioncount
	FROM PSPS.VERSIONINFO
	WHERE versionid = ANY (json_versionid) AND  STATUS <> 'Completed';

	-- Exit if version status is not in 'Completed' status
	IF (v_versioncount > 0) THEN
		SELECT json_build_object(
			'code', 'e028',
			'status','Failed',
			'message', 'VersionID(s) are not in Completed status.'
		) INTO returnMessage;
		RETURN returnMessage;
	END IF;

	-- Check the status of eventid.
	SELECT COUNT(1)
	INTO v_eventidcount
	FROM PSPS.EVENTINFO
	WHERE eventid = json_eventid AND  STATUS <> 'Completed';

	-- Exit if eventid status is not in 'Completed' status
	IF (v_eventidcount > 0) THEN
		SELECT json_build_object(
			'code', 'e029',
			'status','Failed',
			'message', 'Event is not in Completed status.'
		) INTO returnMessage;
		RETURN returnMessage;
	END IF;
	
	-- get all versionid which are tagged with eventid from versioninfo table
	SELECT ARRAY(
		SELECT versionid 
		FROM psps.versioninfo
		WHERE eventid = json_eventid) INTO v_versionidarray;
		
	-- Exit if eventid is not tagged with versionid in versioninfo table.
	IF (v_versionidarray @> json_versionid = FALSE) THEN
		SELECT json_build_object(
			'code', 'e030',
			'status','Failed',
			'message', 'Event is not tagged with versionID(s).'			
		) INTO returnMessage;			
		RETURN returnMessage;	
	END IF;

	-- Check if version(s) exist in eppackagejobinfo table
	SELECT COUNT(1) INTO v_jobqcount
	FROM psps.eppackagejobinfo
	WHERE versionid ::int[]= json_versionid AND eventid = json_eventid AND eventname = json_eventname 
	AND lastversionupdatedon is not null AND isparent =true;

	-- Get max lastupdatedon datetime from versioninfo table
	SELECT max(updatedon) INTO v_lastupdatedon
	FROM PSPS.versioninfo	
	WHERE (versionid = ANY (json_versionid)) ;

	-- If same version(s) exists in eppackagejobinfo table
	IF (v_jobqcount > 0) THEN	
		SELECT max(lastversionupdatedon), jobid, status INTO v_lastversionupdatedon,v_jobid,v_jobstatus
		FROM PSPS.eppackagejobinfo WHERE versionid ::int[]= json_versionid AND lastversionupdatedon is not null 
		AND isparent =true AND eventid = json_eventid AND eventname = json_eventname
		GROUP BY eventid,eventname,jobid,status
		ORDER BY max(lastversionupdatedon) desc limit 1;
		
		--If there is no change in lastupdatedon datetime send the existing jobID.
		IF v_lastupdatedon = v_lastversionupdatedon THEN
			SELECT json_build_object(
				'jobId',v_jobid,
				'jobStatus', v_jobstatus,
				'sqs', 'false'		     		
			) INTO returnMessage;
			RETURN returnMessage;
		END IF;
	END IF;

	-- If version(s) does not exist in eppackagejobinfo table. Insert new record.

	INSERT INTO psps.eppackagejobinfo
			(
				versionid,
				reporttype,
				eventid,
				eventname,
				fileid,
				status,
				code,
				message,
				trial,
				lastupdateddate,
				jobstarttime,
				lastversionupdatedon
			)
		VALUES
			(
				json_versionid,
				json_reporttype,
				json_eventid,
				json_eventname,
				json_fileid,
				'Initialized',
				's012',
				'Job initialization is in progress',
				0,
				now() at time zone 'US/Pacific',
				now() at time zone 'US/Pacific',
				v_lastupdatedon
			) RETURNING jobid INTO v_jobid;

	SELECT json_build_object(
		'jobId',v_jobid,
		'jobStatus', 'Initialized',
		'sqs', 'true'			     		
	) INTO returnMessage;
	RETURN returnMessage;

	EXCEPTION WHEN OTHERS THEN  
		get stacked diagnostics
		v_state   = returned_sqlstate,
		v_exception_messsage    = message_text,
		v_detail  = pg_exception_detail,
		v_hint    = pg_exception_hint,
		v_context = pg_exception_context;

	SELECT json_build_object(
		'status', 'Failed',
		'code', 'e001',
		'message', 'Exception occured while updating record in eppackagejobinfo table.',
		'jobId', v_jobid,
		'state', v_state,
		'context', v_context,
		'errorMessage', v_exception_messsage,
		'details', v_detail,
		'hint', v_hint
	) INTO returnMessage;
	RETURN returnMessage;
END;

$BODY$;

ALTER FUNCTION psps.api_createeppackagejob_v1(json) OWNER TO psps;