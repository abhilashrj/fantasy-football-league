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
	url = "http://localhost/test.php?pos="+position+"&sortBy="+sortBy+"&lid="+leagueId+"&page="+page;
	xmlhttp.open ("GET",url,true);
	xmlhttp.send();
	
}

function playerFetch(position,name,price)
{
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
		if (document.getElementById("shirt"+i).src=="http://localhost/signupLid/images/shirt.png")
		{
			if (position=="Keeper")
			{
				document.getElementById("shirt"+i).src="./images/shirtKeeper.png";
			}

			else
			{
				document.getElementById("shirt"+i).src="./images/shirtPlayer.png";
			}
			document.getElementById("info"+i).innerHTML=name.split(" ")[0];
			document.getElementById("price"+i).innerHTML="$"+price/1000000+"M";
			break;
		}
	}
}	

