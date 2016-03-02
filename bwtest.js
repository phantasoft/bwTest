/*******************************************************************************
Bandwidth Tester
(C) 2016 by Phantasoft S.R.L
phanta-soft.com
root@phanta-soft.com
(+54) 223 432 2297
San Lorenzo 3167
Mar del Plata - Argentina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*******************************************************************************/

(function ( $ ) {
 
    $.bwTest = function( options ) {
	
        var settings = $.extend({
	    test_upload: true,
	    upload_url: 'post.php',
	    download_url: 'bwTest.bin',
	    success: function ( results ) {},
	    progress: function ( progress ) {}
        }, options );

	var results={};

	var bwtest={};
	
	var plugin=this;

	var start = 0;
	var end = 0;
	var binfile = '';            

	var init=function() {
	    test_download();
	}

	bwtest.abort = function(){
	    if(this.downloadxhr !== undefined){
		this.downloadxhr.abort();
	    }
	    
	    if(this.uploadxhr !== undefined){
		this.uploadxhr.abort();
	    }
	}

	var return_cb = function(){
	    settings.success(results);
	}

	var test_download = function(){
	    start = new Date().getTime();
            end = 0;
	    
	    $.ajax({		
                type: "GET",
                url: settings.download_url+"?id=" + start,
		xhr: function()
		{
		    bwtest.downloadxhr = new window.XMLHttpRequest();
		    //Upload progress
		    bwtest.downloadxhr.upload.addEventListener("progress", function(evt){
			
		    }, false);
		    //Download progress
		    bwtest.downloadxhr.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {
			    end = new Date().getTime();
			    diff = (end - start) / 1000;
			    bytes = evt.loaded;
			    speed = (bytes / diff) / 1024 / 1024 * 8;
			    speed = Math.round(speed*100)/100;			    
			    evt.percentage = Math.round((evt.loaded / evt.total)*100);
			    evt.speed=speed;
			    evt.time=diff;
			    evt.testStage='download';
			    settings.progress(evt);			    
			}
		    }, false);
		    return bwtest.downloadxhr;
		}
	    }).done(function(msg) {
                binfile = msg;
                end = new Date().getTime();
                diff = (end - start) / 1000;
                bytes = msg.length;
                speed = (bytes / diff) / 1024 / 1024 * 8;
                speed = Math.round(speed*100)/100;
		results.dl_speed=speed;
		results.dl_time=diff;
		if(settings.test_upload){
		    test_upload();			
		}else{
		    return_cb();
		}
	    });               
	}	
	
	var test_upload = function(){
	    start = new Date().getTime();
            end = 0;
	    
            $.ajax({
                type: "POST",
                url: settings.upload_url+"?id=" + start,
                data: binfile,
		xhr: function()
		{
		    bwtest.uploadxhr = new window.XMLHttpRequest();
		    //Upload progress
		    bwtest.uploadxhr.upload.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {
			    end = new Date().getTime();
			    diff = (end - start) / 1000;
			    bytes = evt.loaded;
			    speed = (bytes / diff) / 1024 / 1024 * 8;
			    speed = Math.round(speed*100)/100;
			    evt.time=diff;
			    evt.percentage = Math.round((evt.loaded / evt.total)*100);
                            evt.speed=speed;
			    evt.testStage='upload';
			    settings.progress(evt);
			}
		    }, false);
		    //Download progress
		    bwtest.uploadxhr.addEventListener("progress", function(evt){
			if (evt.lengthComputable) {
			    var percentComplete = evt.loaded / evt.total;
			}
		    }, false);
		    return bwtest.uploadxhr;
		}
	    }).done(function(msg) {
                end = new Date().getTime();
                diff = (end - start) / 1000;
                bytes = binfile.length;
                speed = (bytes / diff) / 1024 / 1024 * 8;
                speed = Math.round(speed*100)/100;
		results.ul_speed=speed;
		results.ul_time=diff;
		return_cb();
            });
	}	

	init();

	return bwtest;
	
    };
    
    $.fn.bwTest = function( options ) {
	
        var settings = $.extend({
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
	},options );

	var plugin=this;
	
	var bwtest = false;

	$(this).data('bwTest',{});
	
	var init = function(plugin){
	    //$('body').addClass('loading').append('<div class="modal"></div>');	    
	    var my=plugin;
	    
	    append_html_gauge(my);		    
	    
	    function progress( progress ){
		if(progress.testStage=='download'){
		    if( typeof $(this).data('bwTest') !== "undefined"){
			var results = $(this).data('bwTest');		
		    }else{
			var results={};
		    }
		    
		    results.dl_speed=progress.speed;
		    results.dl_time=progress.time;
		    results.dl_percentage=progress.percentage;
		    $(this).data('bwTest',results);
		    $(this)
			.find('.dl_gauge .bw-semi-circle--mask').first()
			.css({'transform':'rotate('+Math.log(progress.speed+1)*46+'deg)'});
		    $(this).find('.dl_gauge .bw-meter>span:first')
			.css({width:progress.percentage+'%'});
		    $(this).find('.dl_gauge .bw-label-speed').html(progress.speed);
		    $(this).data('bwTest',results);
		}else if(progress.testStage=='upload'){
		    var results=$(this).data('bwTest');
		    results.ul_speed=progress.speed;
		    results.ul_time=progress.time;
		    results.ul_percentage=progress.percentage;
		    $(this).data('bwTest',results);
		    $(this)
			.find('.ul_gauge .bw-semi-circle--mask').first()
			.css({'transform':'rotate('+Math.log(progress.speed+1)*46+'deg)'});
			$(this).find('.ul_gauge .bw-meter>span:first')
			.css({width:progress.percentage+'%'});
		    $(this).find('.ul_gauge .bw-label-speed').html(progress.speed);
		}		
	    }
	    
	    function success( results ){		
		$(this).find('.bw-animate').removeClass('bw-animate');
		
		settings.__orig_callback.call(this);
		
		/*$('body').removeClass('loading');	    
		$('.modal').remove();*/
	    }
	    settings.__orig_callback=settings.success;
	    settings.success=success.bind(my);
	    settings.progress=progress.bind(my);
	    bwtest = $.bwTest(settings);
	};
	
	var gen_gauge = function(label1,label2,labelCancel,classname){	   
	    var gauge_container=$('<div class="bw-box bw-gauge '+classname+'"></div>');
	    var gauge=$('<div></div>');
	    gauge.append('<label class="bw-num bw-num_0">0</label>');
	    gauge.append('<label class="bw-num bw-num_1">1</label>');
	    gauge.append('<label class="bw-num bw-num_2">3</label>');
	    gauge.append('<label class="bw-num bw-num_3">5</label>');
	    gauge.append('<label class="bw-num bw-num_4">10</label>');
	    gauge.append('<label class="bw-num bw-num_5">15</label>');
	    gauge.append('<label class="bw-num bw-num_6">25</label>');
	    gauge.append('<label class="bw-num bw-num_7">50</label>');
	    gauge.append('<label class="bw-label-speed"></label>');
	    var progress=$('<div class="bw-label-1 bw-meter bw-animate"><span style="width: 0%"><span class="bw-meter-inner-span">'+label1+'</span></span></div>');
	    progress.hover(function(){
		var el=$(this).find('.bw-meter-inner-span');
		el.data('orig-string',el.html());		
		el.html(labelCancel);
	    },function(){		
		var el=$(this).find('.bw-meter-inner-span');
		el.html(el.data('orig-string'));
	    });
	    progress.on('click',function(){
		bwtest.abort();
		$(this).parents('.bw_test').find('.bw-animate').removeClass('bw-animate');		    
		$(this).parents('.bw_test').find('.bw-meter').off();
		$(this).parents('.bw_test').find('.bw-meter-inner-span').each(function(){
		    $(this).html($(this).data('orig-string'));
		    $(this).parent().css('width','100%')
		});
		settings.__orig_callback.call($(this).parent().parent().parent().parent());
	    });
	    gauge.append(progress);
	    gauge.append('<label class="bw-label-2">'+label2+'</label>');	    
	    var mask=$('<div class="bw-mask"></div>');
	    mask.append('<div class="bw-semi-circle"></div>');
	    mask.append('<div class="bw-semi-circle--mask"></div>');
	    gauge.append(mask);
	    gauge_container.append(gauge);
	    return gauge_container;
	}

	var append_html_gauge = function (plugin){
	    var div=$('<div class="bw_test"></div>');
	    var gauge_dl=gen_gauge(settings.language.download,settings.language.mbps,settings.language.cancel,'dl_gauge');
	    div.append(gauge_dl);
	    if(settings.test_upload){
		var gauge_ul=gen_gauge(settings.language.upload,settings.language.mbps,settings.language.cancel,'ul_gauge');
		div.append(gauge_ul);
	    }
	    plugin.empty().append(div);
	}
	
	init(plugin);

    };

    
}( jQuery ));