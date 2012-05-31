# WS-Perf

## Tests
* Number of disconnections
* Latency
* Bandwidth
* ~~Protocol overhead~~ This is a fact, does not need to be tested.
* Compare with XHR

## Data
To be stored:

* User agent
* Notes (can be used for device, type of network, etc.)
* Results


## Routes

    /                => Home page
    /test/ID         => Test home page (run or see results)
    /test/ID/run     => Test runner
    /test/ID/results => See/Email test results
    /test/ID/delete  => Delete test results from DB