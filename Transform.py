import sqlite3
import random
conn_im=sqlite3.connect("fantasy.sqlite3")
conn_ex=sqlite3.connect("db2.sqlite3")
conn_ex.execute('pragma foreign_keys=ON')
cur_ex=conn_ex.cursor()

#cur_im = conn_im.execute("SELECT * FROM Season")
#for row in cur_im:
#    print row

league_ids_req=[]
team_ids_req = []
#=============================LEAGUE TABLE==============================================
#cur_ex.execute("DROP TABLE IF EXISTS League")
cur_ex.execute("CREATE TABLE League(League_ID INTEGER PRIMARY KEY NOT NULL,Caption TEXT NOT NULL, Name TEXT NOT NULL, Year INTEGER, Num_of_Teams INTEGER)")
cur_in = conn_im.execute("SELECT id,caption,league,year,numberOfTeams from Season")
for row in cur_in:
    if (row[0] != 395) and (row[0] !=403) and (row[0]!=397):
        #print row[0]
        league_ids_req.append(row[0])
        cur_ex.execute("INSERT INTO League (League_ID,Caption,Name,Year,Num_of_Teams) VALUES (?,?,?,?,?)",row)

# cur_ex.execute("SELECT * from League")
# data = cur_ex.fetchall()
# for row in data:
#     print row

#===============================TEAM TABLE=============================================
#cur_ex.execute("DROP TABLE IF EXISTS Team")
cur_ex.execute("CREATE TABLE Team(Team_ID INTEGER PRIMARY KEY NOT NULL, League_ID INTEGER, Name TEXT, Code TEXT, ShortName TEXT, MarketValue TEXT, Position INTEGER, GamesPlayed INTEGER, Points INTEGER, GoalsScored INTEGER, GoalsAgainst INTEGER, FOREIGN KEY (League_ID) REFERENCES League(League_ID))")
cur_in = conn_im.execute("SELECT id,name,shortName,code,squadMarketValue from Team")
cur_in2 = conn_im.execute("SELECT * from TeamInSeason")
for row in cur_in2:
    if row[0] in league_ids_req:
        team_ids_req.append(row[1])
for row in cur_in:
    flag = 0
    for value in row:
        if value == None:
            flag = 1
    #print row
    if not flag:
        if row[0] in team_ids_req:
            cur_ex.execute("INSERT INTO Team (Team_ID,Name,ShortName,Code,MarketValue) VALUES (?,?,?,?,?)",row)
    else:
        if row[0] in team_ids_req:
            team_ids_req.remove(row[0])


#teams not needed
useless_teams = []


cur_in = conn_im.execute("SELECT * from TeamInSeason")
for row in cur_in:
    if (row[0] != 395) and (row[0] !=403) and (row[0]!=397):
        #print(row[1])
        #team_ids_req.append(row[1])
        cur_ex.execute("UPDATE Team SET League_ID = ? WHERE Team_ID = ?", (row[0],row[1]))
    else:
        useless_teams.append(row[1])

cur_in = conn_im.execute("SELECT * from League")
for row in cur_in:
    cur_ex.execute("UPDATE Team SET Position=?, GamesPlayed=?, Points=?, GoalsScored=?, GoalsAgainst=? WHERE Team_ID=?",(row[2],row[3],row[4],row[5],row[6],row[1]))


#print (useless_teams)
# cur_ex.execute("SELECT * from Team")
# data = cur_ex.fetchall()
# for row in data:
#     print (row)

#=============================================================PLAYER TABLE===========================
#cur_ex.execute("DROP TABLE IF EXISTS Player")
cur_ex.execute("CREATE TABLE Player(Player_ID INTEGER PRIMARY KEY NOT NULL, Team_ID INTEGER, Name TEXT, Position TEXT, JerseyNumber INTEGER, DOB DATE, Nationality TEXT, MarketValue TEXT, FOREIGN KEY (Team_ID) REFERENCES Team(Team_ID))")
# cur_in = conn_im.execute("SELECT id,name,position,jerseyNumber,dateOfBirth,nationality,marketValue from Player")
players_req = []

for team in team_ids_req:
    cur_in = conn_im.execute("SELECT id,name,position,jerseyNumber,dateOfBirth,nationality,marketValue from Player")
    cur_in2 = conn_im.execute("SELECT playerid from PlayerInTeam WHERE teamid=?",(team,))
    for player in cur_in2:
        players_req.append(player[0])
    print('player_req',players_req)
    for row in cur_in:
        # print('row',row)
        if row[0] in players_req:
            # print(row[0],team,row[1],row[2],row[3],row[4],row[5],row[6])
            # print('player_req',players_req))
            cur_ex.execute("INSERT INTO Player (Player_ID,Team_ID,Name,Position,JerseyNumber,DOB,Nationality,MarketValue) VALUES (?,?,?,?,?,?,?,?)",(row[0],team,row[1],row[2],row[3],row[4],row[5],row[6]))        
    players_req = []    
# for player in players_req:  
#     cur_ex.execute("INSERT INTO Player (Player_ID,Name,Position,JerseyNumber,DOB,Nationality,MarketValue) VALUES (?,?,?,?,?,?,?)",row)
            
    # if T_ID not in useless_teams:
    #     cur_ex.execute("INSERT INTO Player (Player_ID,Team_ID,Name,Position,JerseyNumber,DOB,Nationality,MarketValue) VALUES (?,?,?,?,?,?,?,?)",(row[0],T_ID,row[1],row[2],row[3],row[4],row[5],row[6]))

# cur_in2 = conn_im.execute("SELECT * from PlayerInTeam")
# for row in cur_in:
#     if row[1] not in useless_teams:
#         print (row[1])
#         cur_ex.execute("UPDATE Player SET Team_ID=? WHERE Player_ID=?",(row[1],row[0]))
#     else:
#         cur_ex.execute("DELETE FROM PLAYER WHERE Player_ID=?",row[0])

cur_ex.execute("SELECT * from Player")
data = cur_ex.fetchall()
for row in data:
    print (row)

#================================================FIXTURE TABLE===========================================

#cur_ex.execute("DROP TABLE IF EXISTS Fixtures")
#print(team_ids_req)
#print(league_ids_req)
cur_ex.execute("CREATE TABLE Fixtures(Fixture_ID INTEGER PRIMARY KEY NOT NULL, League_ID INTEGER, HomeTeam_ID INTEGER, AwayTeam_ID INTEGER, FixtureDate DATE, Status TEXT, Matchday INTEGER, GoalsHomeTeam INTEGER, GoalsAwayTeam INTEGER, FOREIGN KEY (League_ID) REFERENCES League(League_ID), FOREIGN KEY (HomeTeam_ID) REFERENCES Team(Team_ID), FOREIGN KEY (AwayTeam_ID) REFERENCES Team(Team_ID))")
cur_in = conn_im.execute("SELECT fid, sid, homeTeamID, awayTemaID, dateofMatch, status, matchday, goalsHomeTeam, goalsAwayTeam from Fixtures")
for row in cur_in:
    if row[1] in league_ids_req:
        if row[2] in team_ids_req and row[3] in team_ids_req:
            #print(row)
            #try:
            cur_ex.execute("INSERT INTO Fixtures (Fixture_ID,League_ID,HomeTeam_ID,AwayTeam_ID,FixtureDate,Status,Matchday,GoalsHomeTeam,GoalsAwayTeam) VALUES (?,?,?,?,?,?,?,?,?)",row)
            #except sqlite3.IntegrityError:
            #    print("error",row[1],row[2],row[3])
#cur_ex.execute("DELETE FROM Fixtures WHERE HomeTeam_ID NOT IN (SELECT Team_ID FROM Team) OR AwayTeam_ID NOT IN (SELECT Team_ID FROM Team)")
#
# cur_ex.execute("SELECT * from Fixtures")
# data = cur_ex.fetchall()
# for row in data:
#     print row

#=======================================PERFORMANCE TABLE==============================================


def player_in_fixture(fixture_id):
    data_cur = cur_ex.execute("SELECT HomeTeam_ID,AwayTeam_ID from Fixtures WHERE Fixture_ID=?",fixture_id)
    for row in data_cur:
        players = cur_ex.execute("SELECT Player_ID from Player WHERE Team_ID=? OR Team_ID=?",row)
        break
    return players


#cur_ex.execute("DROP TABLE IF EXISTS Performance")
cur_ex.execute("CREATE TABLE Performance(Fixture_ID INTEGER, Player_ID INTEGER, Attack_pts INTEGER, Passing_pts INTEGER, Defence_pts INTEGER, PRIMARY KEY(Fixture_ID,Player_ID), FOREIGN KEY(Fixture_ID) REFERENCES Fixtures(Fixture_ID), FOREIGN KEY(Player_ID) REFERENCES Player(Player_ID) )")
cur_in = conn_ex.execute("SELECT Fixture_ID from Fixtures")


for row in cur_in:
    players = player_in_fixture(row)
    for player in players:
        #print type(row),type(player)
        cur_ex.execute("INSERT INTO Performance(Fixture_ID,Player_ID) VALUES (?,?)",(row[0],player[0]))

rand_1 = random.randint(0,100)
rand_2 = random.randint(0,100)
rand_3 = random.randint(0,100)

cur_ex.execute("UPDATE Performance SET Attack_pts=abs(random())%101, Passing_pts=abs(random())%101, Defence_pts=abs(random())%101")

# cur_ex.execute("SELECT * from Performance")
# data = cur_ex.fetchall()
# for row in data:
#     print row

#===================================USER TABLE========================================================

#cur_ex.execute("DROP TABLE IF EXISTS UserDetails")
cur_ex.execute("CREATE TABLE UserDetails(UserName TEXT PRIMARY KEY NOT NULL,Password TEXT, points INTEGER, Striker1 INTEGER, Striker2 INTEGER, Mid1 INTEGER, Mid2 INTEGER, Mid3 INTEGER, Mid4 INTEGER, Def1 INTEGER, Def2 INTEGER, Def3 INTEGER, Def4 INTEGER, Goalkeeper INTEGER, Striker_sub INTEGER, Mid_sub INTEGER, Def_sub INTEGER, Goalkeeper_sub INTEGER, Star_1 INTEGER, Star_2 INTEGER, Star_3 INTEGER, FOREIGN KEY( Striker1 , Striker2 , Mid1, Mid2 , Mid3, Mid4 , Def1, Def2, Def3, Def4 , Goalkeeper, Striker_sub, Mid_sub, Def_sub, Goalkeeper_sub, Star_1, Star_2, Star_3) REFERENCES Player(Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID,Player_ID))")



conn_im.close()
conn_ex.close()
