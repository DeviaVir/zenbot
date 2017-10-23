#!/bin/bash
tmux list-windows -F '#I'  |   
  while read w; do tmux list-panes -F '#P' -t $w | 
     while read p; do echo -n  "${w}.${p}" ; tmux capture-pane -p -t "${w}.${p}" | 
        tail -n 1 
     done 
  done