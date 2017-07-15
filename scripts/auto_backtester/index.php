<style>
	.demo {
		border:3px solid #000000;
		border-collapse:collapse;
		padding:5px;
		table-layout:fixed;
	}
	.demo th {
		border:3px solid #000000;
		padding:5px;
		background:#F0F0F0;
	}
	.demo td {
		border:3px solid #000000;
		padding:5px;
		background:#DCC4FD;
    	overflow:hidden;
    	white-space:nowrap;
	}
</style>
<script>
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("demo");
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc"; 
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++; 
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
</script>
<?php
ini_set('max_execution_time', 0);
set_time_limit(20);
exec('ulimit -S -n 9999999999');
echo "Current Simulations for the next 24 hours. Simulations run every midnight.";
$path = ".";
$dh = opendir($path);
$i=1;
echo '<html><body><br><a href=/simulations/>Click for graph data</a><br><table class="demo" id="demo">';
echo '<tr>';
echo '<th onclick="sortTable(0)">Date</th>';
echo '<th onclick="sortTable(1)">ROI%</th>';
echo '<th onclick="sortTable(1)">VSBuyHold%</th>';
echo '<th onclick="sortTable(1)">ErrorRate%</th>';
echo '<th onclick="sortTable(1)">Win/Loss</th>';
echo '<th onclick="sortTable(1)">Trades/Day</th>';
echo '<th onclick="sortTable(1)">Ending Balance</th>';
echo '<th onclick="sortTable(1)">Buy Hold</th>';
echo '<th onclick="sortTable(1)">Wins</th>';
echo '<th onclick="sortTable(1)">Losses</th>';
echo '<th onclick="sortTable(1)">Period</th>';
echo '<th onclick="sortTable(1)">Min Periods</th>';
echo '<th onclick="sortTable(1)">SimDays</th>';
echo '<th onclick="sortTable(1)">Trend EMA</th>';
echo '<th onclick="sortTable(1)">Neutral Rate</th>';
echo '<th onclick="sortTable(1)">Oversold RSI Periods</th>';
echo '<th onclick="sortTable(1)">Oversold RSI</th>';
echo '<th onclick="sortTable(1)">Full Command -></th>';
echo '</tr>';
while (($file = readdir($dh)) !== false) {
    if($file != "." && $file != ".." && $file != "index.php" && $file != ".htaccess" && $file != "error_log" && $file != "cgi-bin") {
    	if(fnmatch('*.csv', $file)) {
		$content = file($file);
        $file1 = str_replace(array('backtesting_'),array(""),$file);
        $file2 = str_replace(array('.csv'),array(""),$file1);
        $date = date('r', $file2);
        $content1 = str_replace(array('"":'),array("="),$content[$i]);
        $content2 = str_replace(array('""'),array("--"),$content1);
        $content3 = str_replace(array('"{ '),array(""),$content2);
        $content4 = str_replace(array(' '),array(""),$content3);
        $content5 = str_replace(array('}"'),array(""),$content4);
        $content6 = str_replace(array('--maker--'),array("maker"),$content5);
        $content7 = str_replace(array('--trend_ema--'),array("trend_ema"),$content6);
        $content8 = str_replace(array('BTC--'),array("BTC"),$content7);
        $content9 = str_replace(array('=--'),array("="),$content8);
        $content10 = str_replace(array('m--'),array("m"),$content9);
        echo "<tr>";
    	echo "<td>$date - <a href=$file>Info</a></td>";
	    echo "\n<td>".str_replace(array(","), array("</td><td>", "</td>\n<td>"), $content10)."</td>";
		echo "</tr>";
        }
    }
}
fclose($handle);
closedir($dh);
echo "</table></html>"
?> 