#!/usr/bin/env bash
gh issue list --limit 10000 --state all --json number,title,assignees,state,url \
    | jq  -r '["number","title","assignees","state","url"], (.[] | [.number, .title, (.assignees | if .|length==0 then "Unassigned" elif .|length>1 then map(.login)|join(",") else .[].login end) , .state, .url]) | @tsv' \
    > issues-$(date '+%Y-%m-%d').tsv