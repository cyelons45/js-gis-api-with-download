CREATE OR REPLACE FUNCTION psps.api_updateeppackagejob_v1(param_jobrequest_json json)
    RETURNS json
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
AS $BODY$
/*
 * Author: Vani Chaitanya VCS5
 * Purpose: To update status in psps.eppackagejobinfo table.
 * @args(Input): JSON request with jobID, status,jobstatus, code , trialIncrement and message
 * @returns : JSON object with jobID, code, status, jobstatus and message.
 * Created Date: 09-08-2020
 * Story : PV-695
 * version: 1.0
 */

-- declaration for local variables 
DECLARE
	 json_jobID bigint;
	 json_jobcode text;
	 json_jobstatus text;
	 json_status text;
	 json_jobmessage text;
	 json_trialincrement boolean;
	 v_jobtrialvalue bigint;
-- Exception variables
     v_state   text;
     v_exception_messsage  text;
     v_detail  text;
     v_hint    text;
     v_context text;

-- return message 
     returnMessage json;

BEGIN

	-- Assign values to local variables from input JSON 
	-- trialIncrement paramater will be true when updated from jobstatus API
	SELECT (param_jobrequest_json->>'jobId')::text,
			(param_jobrequest_json->>'code')::text,
			(param_jobrequest_json->>'status')::text,
			(param_jobrequest_json->>'jobStatus')::text,
			(param_jobrequest_json->>'message')::text,
			(param_jobrequest_json->>'trialIncrement')::boolean
	
	INTO json_jobID,json_jobcode,json_status,json_jobstatus,json_jobmessage,json_trialincrement;

	-- Get last trial value
    SELECT trial INTO v_jobtrialvalue
	FROM psps.eppackagejobinfo 
	WHERE jobid = json_jobID;

	-- update record in eppackagejobinfo table
	UPDATE psps.eppackagejobinfo 
		set code=json_jobcode,
		status = json_jobstatus,
		message= json_jobmessage,
		lastupdateddate= now() at time zone 'US/Pacific',
		jobstarttime = now() at time zone 'US/Pacific',
	    trial = case when json_trialincrement = true then v_jobtrialvalue + 1 else v_jobtrialvalue end
		WHERE jobid=json_jobID;

	SELECT json_build_object(
		'status',json_status,
		'code', json_jobcode,
		'message', json_jobmessage,
		'jobId', json_jobID,
		'jobStatus', json_jobstatus		
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
		'message', 'Exception occured while updating record in jobqueue table.',
		'jobId', json_jobID,
		'state', v_state,
		'context', v_context,
		'errorMessage', v_exception_messsage,
		'details', v_detail,
		'hint', v_hint
	) INTO returnMessage;
	RETURN returnMessage;
END;
$BODY$;

ALTER FUNCTION psps.api_updateeppackagejob_v1(json) OWNER TO psps;