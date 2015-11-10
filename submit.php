<?php

$db = new mysqli("localhost","root","",'ffl');

$sql = "UPDATE userdetails SET 
Striker1=$_POST['Striker1'],
Striker2=$_POST['Striker2'],
Mid1=$_POST['Mid1'],
Mid2=$_POST['Mid2'],
Mid3=$_POST['Mid3'],
Mid4=$_POST['Mid4'],
Def1=$_POST['Def1'],
Def2=$_POST['Def2'],
Def3=$_POST['Def3'],
Def4=$_POST['Def4'],
Goalkeeper=$_POST['Goalkeeper'],
Striker_sub=$_POST['Striker_sub'],
Mid_sub=$_POST['Mid_sub'],
Def_sub=$_POST['Def_sub'],
Goalkeeper_sub=$_POST['Goalkeeper_sub'],
Star_1=$_POST['Star_1'],
Star_2=$_POST['Star_2'],
Star_3=$_POST['Star_3'] 
WHERE UserName=$_POST['Username']";
$result = $db->query ($sql);

if($result==true)
{
	echo "Record updated";
}
else
{
	echo "Problem in updating data".$db->error;
}
// Username
// =$_POST['Striker1']
// =$_POST['Striker2']
// =$_POST['Mid1']
// =$_POST['Mid2']
// =$_POST['Mid3']
// =$_POST['Mid4']
// =$_POST['Def1']
// =$_POST['Def2']
// =$_POST['Def3']
// =$_POST['Def4']
// =$_POST['Goalkeep']
// =$_POST['Striker_sub']
// =$_POST['Mid_sub']
// =$_POST['Def_sub']
// =$_POST['Goalkeeper_sub']
// =$_POST['Star_1']
// =$_POST['Star_2']
// =$_POST['Star_3']
?>