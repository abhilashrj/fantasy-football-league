<?php
ob_start();
session_start();
// if(isset($_SESSION['user'])!="")
// {
//  header("Location: home.php");
// }
$db= new mysqli("localhost","root","amshamapple1995","ffl");

if(isset($_POST['signup']))
{
 $uname = $db->real_escape_string($_POST['username']);
 $lid=$db->real_escape_string($_POST['lidSelected']);
 $dname=$db->real_escape_string($_POST['displayName']);
 $upass = md5($db->real_escape_string($_POST['password']));
 $result = $db->query("INSERT INTO userdetails(UserName,Password,League_ID,DisplayName) VALUES('$uname','$upass',$lid,'$dname')");
 if($result==true)
 {
 	$_SESSION['user']=$uname;
  ?>	
        <script>alert('successfully registered ');</script>
        <?php
        header("Location: login_new.html");
}
 else
 {
  ?>
        <script>alert('error while registering you...');</script>
        <?php
 }
}
$db->close();
?>