var playerList = []; 
var amountRemaining = 10;

function Filter(position,sortBy,leagueId,page)
{
	if (window.XMLHttpRequest)
	{
		xmlhttp = new XMLHttpRequest();
	}
	else
	{
		xmlhttp = new ActiveXObject ("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function ()
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			document.getElementById("ismElementDataTable").innerHTML = xmlhttp.responseText;
		}
	}
	url = "http://localhost/Fantasy Football/test.php?pos="+position+"&sortBy="+sortBy+"&lid="+leagueId+"&page="+page;
	xmlhttp.open ("GET",url,true);
	xmlhttp.send();
	
}

function playerFetch(position,name,price)
{
	if (playerList.indexOf(name) != -1){
				window.alert("Player Already Selected");
				return;
				}

	var moneySpent=price/1000000;
	if ((amountRemaining-moneySpent)<0)
	{
		window.alert("Budget underflow!");
		return;
	}

	//window.alert(position);
	//var ShirtList = document.getElementById("ismGraphical1").getElementsByClassName("ismPlayerContainer");
	if (position=="Keeper")
	{
		start=1;
		end=2;
	}
	else if (position=="Defender")
	{
		start=3;
		end=7;
	}
	else if (position=="MidField")
	{
		start=8;
		end=12;
	}
	else
	{
		start=13;
		end=15;
	}
	
	for (i=start;i<=end;i++)
	{
		console.log(document.getElementById("shirt"+i).src);
		if (document.getElementById("shirt"+i).src=="http://localhost/FantasyFootball/images/shirt.png")
		{
			//console.log("came inside");

			
			if (position=="Keeper")
			{
				document.getElementById("shirt"+i).src="./images/shirtKeeper.png";
			}

			else
			{
				document.getElementById("shirt"+i).src="./images/shirtPlayer.png";
			}
			document.getElementById("info"+i).innerHTML=name.split(" ")[0];
			playerList.push(name);
			if (playerList.length==15)
			{
				document.getElementById("SquadStatus").innerHTML="Your squad is now complete!";
			}
			document.getElementById("price"+i).innerHTML="$"+moneySpent+"M";
			amountRemaining-=moneySpent;
			document.getElementById("ismToSpend").innerHTML="$"+amountRemaining.toFixed(2)+"M";
			document.getElementById("ismNumSelected").innerHTML=playerList.length;
			document.getElementById("shirtout"+i).style.display= "inline";
			break;
		}
	}
}	

function removePlayer(elementID)
{
	var index = elementID.slice(8,elementID.length);
	document.getElementById("shirt"+index).src="./images/shirt.png";
	document.getElementById("info"+index).innerHTML = "";
	var price = document.getElementById("price"+index).innerHTML;
	amountRemaining = amountRemaining + parseFloat(price.slice(1,price.length-1),10);
	document.getElementById("price"+index).innerHTML="";
	document.getElementById("ismToSpend").innerHTML="$"+amountRemaining.toFixed(2)+"M";
	document.getElementById("shirtout"+index).style.display = "none";
	playerList.splice(playerList.indexOf(document.getElementById("info"+index)),1);
	if (playerList.length<15)
	{
		document.getElementById("SquadStatus").innerHTML="Your squad is not complete yet.";
	}
	document.getElementById("ismNumSelected").innerHTML=playerList.length;
}