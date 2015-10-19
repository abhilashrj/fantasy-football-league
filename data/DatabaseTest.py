import json
import sqlite3
import http.client
APIKEY = "ab22804642e54e6b8c943c70eb9eae09"


conn=sqlite3.connect("fantasy.sqlite3")
cur=conn.cursor()
cur.execute("DROP TABLE IF EXISTS Leagues")
cur.execute("CREATE TABLE Leagues (league_id INTEGER PRIMARY KEY NOT NULL,caption TEXT,league TEXT,year INTEGER,numberOfTeams INTEGER,numberOfGames INTEGER,lastUpdated TEXT)")
soccer_League_prefix = '/alpha/soccerseasons/'
season_ids = []
connection = http.client.HTTPConnection('api.football-data.org')
headers = { 'X-Auth-Token': APIKEY }

connection.request('GET', soccer_League_prefix, None, headers )
response = json.loads(connection.getresponse().read().decode())

for row in response:
	season_ids.append(row['_links']['self']['href'].rsplit('/',1)[-1])
	tup=(int(row['_links']['self']['href'].rsplit('/',1)[-1]),row['caption'],row['league'],row['year'],row['numberOfTeams'],row['numberOfGames'],row['lastUpdated'])
	cur.execute('INSERT INTO Leagues VALUES(?,?,?,?,?,?,?)',tup)
	del tup
conn.commit()


#cur.execute("SELECT * FROM FantasyLeague")
#rows = cur.fetchall()

#for row in rows:
#    print (row)

#****************************************************Teams************************************************************************
cur.execute("DROP TABLE IF EXISTS Teams")
cur.execute("CREATE TABLE Teams (team_id INTEGER PRIMARY KEY NOT NULL,league_id INTEGER, squadMarketValue TEXT, position INTEGER, playedGames INTEGER, points INTEGER, goalsScored INTEGER, goalsAgainst INTEGER, FOREIGN KEY (league_id) REFERENCES Leagues(league_id))")

for id in season_ids:
	team_url = soccer_League_prefix + id + '/teams'
	connection.request('GET' , team_url, None, headers)
	response = json.loads(connection.getresponse().read().decode())

	for dic in response['teams']:
		tup = (dic['_links']['self']['href'].rsplit('/',1)[-1], dic['squadMarketValue'])
		#print(sorted(tup, key=lambda tup: tup[0]))
		print(tup)
		#cur.execute('INSERT INTO Teams (team_id,squadMarketValue) VALUES(?,?)',tup)
		del tup
conn.commit()

for id in season_ids:
	leagueTable_url = soccer_League_prefix + id + '/leagueTable'
	connection.request('GET', leagueTable_url, None, headers)
	response = json.loads(connection.getresponse().read().decode())

	for dic in response['standing']:
		tup = (dic['position'],dic['playedGames'], dic['points'],dic['goals'],dic['goalsAgainst'])
		cur.execute('INSERT INTO Teams (position,playedGames,points,goalsScored,goalsAgainst) VALUES(?,?,?,?,?)',tup)
		del tup
conn.commit()

#print(season_ids)






#****************************************************Fixtures*********************************************************************
cur.execute("DROP TABLE IF EXISTS Fixtures")
cur.execute("CREATE TABLE Fixtures (fixture_id INTEGER, FOREIGN KEY league_id REFERENCES Leagues(league_id), Period_id INTEGER, homeTeam TEXT,awayTeam TEXT,_date DATE,status TEXT, matchday INTEGER, goalsAwayTeam INTEGER,goalsHomeTeam INTEGER, PRIMARY KEY (fixture_id))")

#print(season_ids)

for id in season_ids:
	fixture_url = soccer_League_prefix + id + '/fixtures'
	#print(fixture_url)
	connection.request('GET', fixture_url, None, headers)
	response = json.loads(connection.getresponse().read().decode())
	print(type(response))
	for dic in response['fixtures']:
		tup = (int(row['_links']['self']['href'].rsplit('/',1)[-1]), dic['homeTeamName'],dic['awayTeamName'],dic['date'],dic['status'],int(dic['matchday']),int(dic['result']['goalsHomeTeam']),int(dic['result']['goalsAwayTeam']))
		cur.execute('INSERT INTO Fixtures (fixture_id, homeTeam,awayTeam,_date,status,matchday,goalsHomeTeam,goalsAwayTeam) VALUES(?,?,?,?,?,?,?,?)',tup)
		del tup
conn.commit()

#cur.execute("SELECT * FROM Fixtures")
#rows = cur.fetchall()
#
#for row in rows:
#    print (row)



cur.close()
