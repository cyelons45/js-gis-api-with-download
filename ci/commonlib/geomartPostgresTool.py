# ===========================================================================
#geomartPostgresTool.py
# ---------------------------------------------------------------------------
#
# This script contains useful postgres database functions.
# Usage: import geomartPostgresTool
#        Then call a function in this script
#
# ===========================================================================

# Import system modules...
print ("Loading geomartPostgresTool libraries")
import psycopg2
import os

class PostgresTool:
    """
        Helper function for Postgres
    """
    def __init__(self, dbhost,dbname,username,password):
        """
            connect postgres db connection
        """        
        try:            
            self.postgresConn = psycopg2.connect(dbname=dbname, user=username, host=dbhost,password=password)

        except (Exception, psycopg2.DatabaseError) as e:
            raise Exception("Postgress DB Error on db connection.." + str(e))

    def getvalueFromSqlQuery(self, sqlQuery, fieldName):
        """
            get value from sql query for given field
            sqlQuery : query to execute
        """
        cur = self.executeSQLQuery(sqlQuery)
        row = cur.fetchone()
        return row[0]

     # function to connect to postgres and execute sql query from file
    def executeScriptsFromFile(self,filename):
        """
            execute sql query in file
            filename : sql file name for execution 
        """
        print(filename)
        if(os.path.exists(filename)):
            # Open and read the file as a single buffer
            fd = open(filename, encoding='utf-8-sig')
            sqlFile = fd.read()
            fd.close()
            print("executing file")
            cur = self.executeMultiplSQLQuery(sqlFile)
            return cur
        else:
            print(filename + " does not exist")
            return None

    # function to connect to postgres and execute sql query
    def executeSQLQuery(self,sqlQuery):
        """
            execute given sql query
            sqlQuery: sql query 
        """
        if self.postgresConn != None:
            cur = self.postgresConn.cursor()

            # Execute every command from the input file
            if sqlQuery != '':
                cur.execute(sqlQuery)

            return cur

    # function to connect to postgres and execute sql query
    def executeMultiplSQLQuery(self,sqlCommands):
        """
            execute multiple sql query
            sqlCommands : Execute sql commands
        """
        # all SQL commands (split on ';')
        sqlCommands = sqlCommands.split(';')

        if self.postgresConn != None:
            self.postgresConn.autocommit = True
            cur = self.postgresConn.cursor()

            # Execute every command from the input file
            for command in sqlCommands:
                if(command.find('--') != -1):
                    print(command)

                if command != '':
                    cur.execute(command)

            return cur

    def commit(self):
        """
            commit changes
        """
        self.postgresConn.commit()

    def rollback(self):
        """
            rollback changes
        """
        self.postgresConn.rollback()

    def close(self):
        """
            close connection
        """
        self.postgresConn.close()

    # function to copy CSV to postgres table
    def copyCSVtoTable(self,filename,columnnames, targettablename, csvseperator):
        """
            copy csv to table
        """
        try:
            if self.postgresConn != None:
                cur = self.postgresConn.cursor()
                sqlcmd = "copy " + targettablename +"(" + columnnames + ") from STDIN DELIMITERS " + csvseperator +" CSV header ;"
                with open(filename) as f:
                    cur.copy_expert(sql=sqlcmd,file=f)
                self.postgresConn.commit()
                return True
        except Exception as e:
            raise Exception("Copy CSV to Postgres Table Failed.." + e)

    def createFunctionOrSchemaFromFile(self,filename):
        """
            execute sql query in file
        """
        print(filename)
        if(os.path.exists(filename)):
            # Open and read the file as a single buffer
            fd = open(filename, encoding='utf-8-sig')
            sqlFile = fd.read()
            fd.close()
            print("executing file")
            cur = self.executeSQLQuery(sqlFile)
            return cur
        else:
            print(filename + " does not exist")
            return None