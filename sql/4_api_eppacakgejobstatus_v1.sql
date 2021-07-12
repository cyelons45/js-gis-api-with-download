-- FUNCTION: psps.api_eppackagejobstatus_v1(json)

-- DROP FUNCTION psps.api_eppackagejobstatus_v1(json);

CREATE OR REPLACE FUNCTION psps.api_eppackagejobstatus_v1(
	param_job_json json)
    RETURNS json
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
AS $BODY$/*
 * Purpose: For a given Job ID, return the job's code, status, message, jobStatus and downloadLink.
 * param_jobid_json should have jobID and jobRuntime fields
 * Story : PV-695
 * version: 1.0
 * Created On: 08-09-2020
 */
 
DECLARE 
    -- Input variables
    v_input_jobId bigint;
	v_input_runtime bigint;
		
	-- Variable for deriving values
	v_jobexists boolean;
	v_trial bigint;
	v_jobstarttime timestamp;
	v_currenttime timestamp;
	v_runtime double precision;
	v_status text;
	v_log boolean;
	v_outputfilepath TEXT;
    v_reporttype TEXT;

	-- return message	
	v_returnmessage json;
		
	-- Exception variables
	v_state text;
    v_msg text;
    v_detail text;
    v_hint text;
    v_context text;

BEGIN
	-- Parse JSON and assign values to local variables
	SELECT 	(param_job_json->>'jobID')::bigint,
			(param_job_json->>'jobRuntime')::bigint			
	INTO    v_input_jobId, v_input_runtime;

    -- Check if job ID exist
    SELECT NOT EXISTS (select true from psps.eppackagejobinfo where jobid= v_input_jobId) INTO v_jobexists;

    -- Exit if job ID not found
    IF v_jobexists THEN
    	SELECT json_build_object(
    	        'code', 'e010',
    	        'status', 'Failed',
    	        'message', 'The requested jobID was not found'
        )  INTO v_returnmessage;
        RETURN v_returnmessage;
    END IF ;

    -- Retrive trail, status, outputfilepath, reporttype and jobruntime of requested job
	SELECT trial, jobstarttime, status, outputfilepath, reporttype
	INTO v_trial, v_jobstarttime, v_status, v_outputfilepath, v_reporttype
	FROM psps.eppackagejobinfo  
	WHERE jobid = v_input_jobId;
	
 
    -- If status is completed, send response with individual job status
    IF (v_status = 'Completed' ) THEN
        SELECT json_build_object(
                'code', 's007',
                'status', 'Success',
                'message', 'Request processed successfully',
                'jobStatus', v_status,
                'downloadLink',v_outputfilepath,
			    'sqs', false
        )  INTO v_returnmessage;
        RETURN v_returnmessage;
    END IF ;

    -- Send request to sqs again if trial value is less than three
	IF(v_trial < 3  AND v_status = 'Failed') THEN 
        SELECT json_build_object(
        	'reportType', v_reportType,
			'jobStatus', '',
			'status', 'In Queue',
            'sqs', true
        ) INTO v_returnmessage;
        RETURN v_returnmessage;
     END IF;
	
	-- Calculate current time
	SELECT now() at time zone 'US/Pacific'
	INTO v_currenttime;
	
    -- Calculate runtime(currentime - jobstarttime) in minutes
	SELECT (DATE_PART('day', v_currenttime - v_jobstarttime) * 24 + 
              DATE_PART('hour', v_currenttime - v_jobstarttime)) * 60 +
              DATE_PART('minute', v_currenttime - v_jobstarttime)
	INTO v_runtime;
	
	-- If job is not completed and trial value is less than three and jobruntime not crossed the threshold limit
	IF (v_trial < 3 AND v_runtime <= v_input_runtime AND v_status <> 'Completed') THEN
		SELECT json_build_object(
				'code', 's007',
				'status', 'Success',
				'message', 'Request processed successfully.',
				'jobStatus', v_status,
			    'downloadLink', '',
			    'sqs', false
		) INTO v_returnmessage;
		RETURN v_returnmessage;
	END IF ;

    -- If job trial value is three and status is not completed. 
	IF (v_trial >= 3 AND v_status <> 'Completed') THEN
		SELECT json_build_object(
				'code', 'e022',
				'status', 'Failed',
				'message', 'Exceeded trial attempt. Please contact administrator.',
				'jobStatus', v_status,
				'downloadLink', '',
			    'sqs', false
		) INTO v_returnmessage;
		RETURN v_returnmessage;
	END IF ;

    -- Send message to sqs when jobruntime crossed the threshold and status is not completed.
	IF (v_trial < 3 AND v_runtime > v_input_runtime AND v_status <> 'Completed') THEN
		SELECT json_build_object(
			'reportType', v_reporttype,
			'jobStatus', v_status,
            'status', 'In Queue',
			'downloadLink', '',
            'sqs', true
    	) INTO v_returnmessage;
	RETURN v_returnmessage;
	END IF;	

	EXCEPTION WHEN OTHERS THEN  
	    get stacked diagnostics
        v_state   = returned_sqlstate,
        v_msg     = message_text,
        v_detail  = pg_exception_detail,
        v_hint    = pg_exception_hint,
        v_context = pg_exception_context;
		
    	SELECT json_build_object(
        	'status', 'Failed',
        	'code', 'e001',
			'message', 'Exception occured while retrieving data sharing job status',
			'context', v_context,
			'errorMessage', v_msg,
			'details',v_detail,
			'hint',v_hint
    )  INTO v_returnmessage;
	RETURN v_returnmessage;

END;$BODY$;

ALTER FUNCTION psps.api_eppackagejobstatus_v1(json)
    OWNER TO psps;