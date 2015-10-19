import json
import sqlite3
import http.client
import time
APIKEY = ["ab22804642e54e6b8c943c70eb9eae09","a734d77d45854e3cae446e71cd70757a"]
num=0
key=APIKEY[num]
connection=http.client.HTTPConnection('api.football-data.org')
headers = { 'X-Auth-Token': key }

conn=sqlite3.connect("fantasy.sqlite3")
cur=conn.cursor()

#Season Table
cur.execute("DROP TABLE IF EXISTS Season")
cur.execute("CREATE TABLE Season (id INTEGER PRIMARY KEY NOT NULL,caption TEXT,league TEXT,year INTEGER,numberOfTeams INTEGER,numberOfGames INTEGER,lastUpdated TEXT)")

#Team Table
cur.execute("DROP TABLE IF EXISTS Team")
cur.execute("CREATE TABLE Team (id INTEGER PRIMARY KEY NOT NULL,name TEXT,shortName TEXT,code TEXT,squadMarketValue TEXT)")

#Season Table
cur.execute("DROP TABLE IF EXISTS TeamInSeason")
cur.execute("CREATE TABLE TeamInSeason (seasonid INTEGER,teamid INTEGER)")

#players Table
cur.execute("DROP TABLE IF EXISTS Player")
cur.execute("CREATE TABLE Player (id INTEGER PRIMARY KEY NOT NULL,name TEXT,position TEXT,jerseyNumber INTEGER,dateOfBirth DATE,nationality TEXT,contractUntil DATE,marketValue TEXT)")

# #Player Team Table
cur.execute("DROP TABLE IF EXISTS PlayerInTeam")
cur.execute("CREATE TABLE PlayerInTeam (playerid INTEGER,teamid INTEGER)")

cur.execute("DROP TABLE IF EXISTS League")
cur.execute("CREATE TABLE League (sid INTEGER NOT NULL,tid INTEGER NOT NULL,position INTEGER,playedGames INTEGER,points INTEGER,goals INTEGER,goalsAgainst INTEGER,PRIMARY KEY(sid,tid))")

cur.execute("DROP TABLE IF EXISTS Fixtures")
cur.execute("CREATE TABLE Fixtures (sid INTEGER NOT NULL,fid INTEGER NOT NULL,homeTeamID INTEGER,awayTemaID INTEGER,dateofMatch DATE,status TEXT,matchday INTEGER,goalsHomeTeam INTEGER,goalsAwayTeam INTEGER,PRIMARY KEY (sid,fid))")

def connect ():
    global num
    global APIKEY
    global connection
    connection.close()
    time.sleep(2)
    if (num==0):
        num=1
    else:
        num=0
    key=APIKEY[num]
    connection=http.client.HTTPConnection('api.football-data.org')
    headers = { 'X-Auth-Token': key }
    return

connection.request('GET', '/alpha/soccerseasons', None, headers )
response = json.loads(connection.getresponse().read().decode())


for row in response:

    #team tables values from teams
    sid=int(row['_links']['self']['href'].rsplit('/',1)[-1])
    connection.request('GET',row['_links']['teams']['href'],None,headers)
    teamJson=json.loads(connection.getresponse().read().decode())

    flag=1
    misteam=[]
    while ('error' in teamJson.keys()):
        print("teamLoop: "+str(teamJson['error']))
        connect()
        connection.request('GET',row['_links']['teams']['href'],None,headers)
        teamJson=json.loads(connection.getresponse().read().decode())
    if ('teams' in teamJson.keys()):
        for eachteamInTeamsTable in teamJson['teams']:
            tid=int(eachteamInTeamsTable['_links']['self']['href'].rsplit('/',1)[-1])

            tidtup=(tid,)
            cur.execute('SELECT * FROM Team WHERE id=?',tidtup)
            rows = cur.fetchall()

            #inserting into team table only after checking that team is not there 
            if(len(rows) == 0):
                # inserting in teaminseason table
                connection.request('GET',eachteamInTeamsTable['_links']['players']['href'],None,headers)
                playersJson=json.loads(connection.getresponse().read().decode())

                while ('error' in playersJson.keys()):
                    print("playerLoop: "+str(playersJson['error']))
                    connect()
                    connection.request('GET',eachteamInTeamsTable['_links']['players']['href'],None,headers)
                    playersJson=json.loads(connection.getresponse().read().decode())

                if (playersJson['count']==0):
                    flag=2
                    misteam.append(tid)
                    s="team with id "+str(tid)+" missing";
                    print(s)
                    break
    else:
        print("Season "+str(sid)+" gone!")
        flag=0
        continue

    connection.request('GET',row['_links']['leagueTable']['href'],None,headers)
    LeagueJson=json.loads(connection.getresponse().read().decode())

    while ('error' in LeagueJson.keys()):
        print("LeagueLoop: "+str(LeagueJson['error']))
        if (sid==405):
            break
        connect()
        connection.request('GET',row['_links']['leagueTable']['href'],None,headers)
        LeagueJson=json.loads(connection.getresponse().read().decode())

    if ('standing' not in LeagueJson.keys()):
        flag=0
        continue

    connection.request('GET',row['_links']['fixtures']['href'],None,headers)
    FixtureJson=json.loads(connection.getresponse().read().decode())

    while ('error' in FixtureJson.keys()):
        print("FixtureLoop: "+str(FixtureJson['error']))
        connect()
        connection.request('GET',row['_links']['fixtures']['href'],None,headers)
        FixtureJson=json.loads(connection.getresponse().read().decode())

    if ('fixtures' not in FixtureJson.keys()):
        flag=0
        continue

    if (flag==1 or flag==2):
        #inserting in Season Table
        sid=int(row['_links']['self']['href'].rsplit('/',1)[-1])
        stup=(sid,row['caption'],row['league'],row['year'],row['numberOfTeams'],row['numberOfGames'],row['lastUpdated'])
        cur.execute('INSERT INTO Season VALUES(?,?,?,?,?,?,?)',stup)

        # #team tables values from teams
        # connection.request('GET',row['_links']['teams']['href'],None,headers)
        # teamJson=json.loads(connection.getresponse().read().decode())


        for eachteamInTeamsTable in teamJson['teams']:
            tid=int(eachteamInTeamsTable['_links']['self']['href'].rsplit('/',1)[-1])
            if (tid in misteam):
                continue

            tidtup=(tid,)
            cur.execute('SELECT * FROM Team WHERE id=?',tidtup)
            rows = cur.fetchall()

            #inserting into team table only after checking that team is not there 
            if(len(rows) == 0):
                ttup=(tid,eachteamInTeamsTable['name'],eachteamInTeamsTable['shortName'],eachteamInTeamsTable['code'],eachteamInTeamsTable['squadMarketValue'])
                cur.execute('INSERT INTO Team VALUES (?,?,?,?,?)',ttup)

                #inserting in teaminseason table
                tstup=(sid,tid)
                cur.execute('INSERT INTO TeamInSeason VALUES (?,?)',tstup)

                connection.request('GET',eachteamInTeamsTable['_links']['players']['href'],None,headers)
                playersJson=json.loads(connection.getresponse().read().decode())

                while ('error' in playersJson.keys()):
                    print("PlayerLoop2: "+str(playersJson['error']))
                    connect()
                    connection.request('GET',eachteamInTeamsTable['_links']['players']['href'],None,headers)
                    playersJson=json.loads(connection.getresponse().read().decode())

                for eachPlayer in playersJson['players']:
                    pid=eachPlayer['id']
                    pidtup=(pid,)
                    cur.execute('SELECT * FROM Player WHERE id=?',pidtup)
                    rows=cur.fetchall()

                    if(len(rows) == 0):
                        ptup=(pid,eachPlayer['name'],eachPlayer['position'],eachPlayer['jerseyNumber'],eachPlayer['dateOfBirth'],eachPlayer['nationality'],eachPlayer['contractUntil'],eachPlayer['marketValue'])
                        cur.execute('INSERT INTO Player VALUES (?,?,?,?,?,?,?,?)',ptup)
                        pttup=(pid,tid)
                        cur.execute('INSERT INTO PlayerInTeam VALUES (?,?)',pttup)


        # connection.request('GET',row['_links']['leagueTable']['href'],None,headers)
        # LeagueJson=json.loads(connection.getresponse().read().decode())


        for eachteamInLeagueTable in LeagueJson['standing']:
            tid=int(eachteamInLeagueTable['_links']['team']['href'].rsplit('/',1)[-1])
            if (tid in misteam):
                continue
            ltup=(sid,tid,eachteamInLeagueTable['position'],eachteamInLeagueTable['playedGames'],eachteamInLeagueTable['points'],eachteamInLeagueTable['goals'],eachteamInLeagueTable['goalsAgainst'])
            cur.execute('INSERT INTO League VALUES (?,?,?,?,?,?,?)',ltup)


        # connection.request('GET',row['_links']['fixtures']['href'],None,headers)
        # FixtureJson=json.loads(connection.getresponse().read().decode())

        for eachFixture in FixtureJson['fixtures']:
            fid=int(eachFixture['_links']['self']['href'].rsplit('/',1)[-1])
            homeTeamID=int(eachFixture['_links']['homeTeam']['href'].rsplit('/',1)[-1])
            awayTemaID=int(eachFixture['_links']['awayTeam']['href'].rsplit('/',1)[-1])
            if (homeTeamID in misteam or awayTemaID in misteam):
                continue
            ftup=(sid,fid,homeTeamID,awayTemaID,eachFixture['date'],eachFixture['status'],eachFixture['matchday'],eachFixture['result']['goalsHomeTeam'],eachFixture['result']['goalsAwayTeam'])
            cur.execute('INSERT INTO Fixtures VALUES (?,?,?,?,?,?,?,?,?)',ftup)

    print("season done")

conn.commit()

cur.execute("SELECT * FROM Season")
rows = cur.fetchall()
print("Season Table")
for row in rows:
    print (row)



cur.execute("SELECT * FROM Team ORDER BY id")
rows = cur.fetchall()
print("Team Table")
for row in rows:
    print (row)

cur.execute("UPDATE League SET position=position-1 WHERE sid=397 AND position>12")
cur.execute("UPDATE League SET position=position-1 WHERE sid=400 AND position>12")
cur.execute("UPDATE League SET position=position-1 WHERE sid=400 AND position>14")
cur.execute("UPDATE League SET position=position-1 WHERE sid=403 AND position>7")
cur.execute("UPDATE League SET position=position-1 WHERE sid=404 AND position>8")

cur.execute("SELECT * FROM League ORDER BY sid,position")
rows = cur.fetchall()
print("League Table")
for row in rows:
    print (row)

cur.execute("SELECT * FROM Player")
rows = cur.fetchall()
print("Players Table")
for row in rows:
    print (row)

cur.execute("SELECT * FROM Fixtures")
rows = cur.fetchall()
print("Fixtures Table")
for row in rows:
    print (row)
cur.close()