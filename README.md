AUTHOR:
Bandwidth Tester
(C) 2016 by Phantasoft S.R.L
phanta-soft.com
root@phanta-soft.com
(+54) 223 432 2297
San Lorenzo 3167
Mar del Plata - Argentina

Bandwidth Tester V 0.1


USAGE: 

Include the files in your head: 

<script src="bwtest.js"></script>    
<link rel="stylesheet" type="text/css" href="bwtest.css">

And use it either on its own or on a DOM element to create gauges. 


Runs the test and returns results and progress to your own callbacks: 

$.bwTest({	
	    test_upload: true,                   // Whether to test upload bandwidth or not. True/False
	    upload_url: 'post.php',              // POST file URL. Just an empty executable script to post to. 
	    download_url: 'bwTest.bin',          // Binary file to test download. It can be of any size, larger files will give more accurate results. Populate with random data. 
	    success: function ( results ) {},    // Success callback. Returns an object with test results. 
	    progress: function ( progress ) {},  // Progress function. Fires on Upload/Download progress. Returns an object with test results and progress so far. 
});

Returns an Object with an abort() method, plus the XHR objects used in the test. 

Or with a GUI: 

$(element).bwTest({
                   test_upload: true,
                   upload_url: 'post.php',       
                   download_url: 'bwTest.bin',
                   success: function ( results ) {},
                   progress: function ( progress ) {},
                   language: {
                              'download':'Download',
                              'upload':'Upload',
                              'mbps': 'Megabits per second',
                              'cancel':'Cancel',		
  		  }
});

It creates two animated gauges, customize in bwtest.css

See index.html for a demo. 
