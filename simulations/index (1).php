<?php
$path_to_check = '';
$needle = 'end balance:';
$needle1 = '"meas": ';
$needle2 = 'error rate: ';
$needle3 = 'error rate: ';
foreach(glob($path_to_check . '*.html') as $filename)
{
  foreach(file($filename) as $fli=>$fl)
  {
    if(strpos($fl, $needle)!==false)
    {
      echo $filename . ' on line ' . ($fli+1) . ': ' . $fl;
    }
  }
  foreach(file($filename) as $fli=>$flz)
  {
    if(strpos($flz, $needle1)!==false)
    {
      echo $flz;
    }
  }
  foreach(file($filename) as $fli=>$fly)
  {
    if(strpos($fly, $needle2)!==false)
    {
      echo $fly;
      echo '<br>';
    }
  }
}
?>