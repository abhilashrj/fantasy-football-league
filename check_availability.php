<?php
$conn = new mysqli("localhost","root","amshamapple1995","ffl");



if(!empty($_POST["username"])) {
	$username = $_POST["username"];
  $result = $conn->query("SELECT count(*) as cnt FROM userdetails WHERE UserName='$username'");
  $row = $result->fetch_assoc();
  $user_count = $row['cnt'];
  // echo "$user_count";
  if($user_count>0) {
      echo "<span class='status-not-available'> Username Not Available.</span>";
  }else{
      echo "<span class='status-available'> Username Available.</span>";
  }
}
?>