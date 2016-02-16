// ############################## Helper functions ##############################

// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
	$(".slide").hide();
	// Show just the slide we want to show
	$("#"+id).show();
}

// Get random integers.
// When called with no arguments, it returns either 0 or 1. When called with one argument, *a*, it returns a number in {*0, 1, ..., a-1*}. When called with two arguments, *a* and *b*, returns a random value in {*a*, *a + 1*, ... , *b*}.
function random(a,b) {
	if (typeof b == "undefined") {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}

// Add a random selection function to all arrays (e.g., <code>[4,8,7].random()</code> could return 4, 8, or 7). This is useful for condition randomization.
Array.prototype.random = function() {
  return this[random(this.length)];
}

// shuffle function - from stackoverflow?
// shuffle ordering of argument array -- are we missing a parenthesis?
function shuffle (a) 
{ 
    var o = [];
    
    for (var i=0; i < a.length; i++) {
	o[i] = a[i];
    }
    
    for (var j, x, i = o.length;
	 i;
	 j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);	
    return o;
}



// ############################## Configuration settings ##############################


//####     Attitudes scale ######
var condition = 0;

var page = 0;

var atts = ['Decisive',
'Competitive',
'Self-reliant',
'Willing to take risks',
'Ambitious',
'Daring',
'Adventurous',
'Courageous',
'Sensitive',
'Cooperative',
'Understanding of others',
'Helpful to others',
'Sympathetic',
'Nurturing',
'Warm in relationships with others',
'Supportive']; 

atts = shuffle(atts); 

var totalTrialsAtt = atts.length;

var numTrialsExperiment = totalTrialsAtt
var trials = [];

// first build attitudes question trials
for (i = 0; i < totalTrialsAtt; i++) {
	trial = {
		sentence: atts[i],
		trial_number_block: i +1,
		trial_type: "attitudes"
	}

	trials.push(trial);
}


// Show the instructions slide -- this is what we want subjects to see first.
showSlide("instructions");



// ############################## The main event ##############################
var experiment = {
    
    // The object to be submitted.
    data: {
    trial_number_block: [],
    trial_type: [],
	sentence: [],
	rating: [],
	age: [],
	gender: [],
	education: [],
	homelang: [],
	ethnicity:[],
	expt_aim: [],
	expt_gen: [],
	condition: [],
	income:[],
	political: [],
    },
    
    // end the experiment
    end: function() {
	  showSlide("finished");
	  setTimeout(function() {
	  	 console.log(experiment.data);
	     turk.submit(experiment.data) 
	  }, 1500);
	return experiment.data;
    },

    // LOG RESPONSE
    log_response: function() {

	var response_logged = false;

	
	//Array of radio buttons
	var radio = document.getElementsByName("judgment");
	
	// Loop through radio buttons
	for (i = 0; i < radio.length; i++) {
	    if (radio[i].checked) {
		experiment.data.rating.push(radio[i].value);
		response_logged = true;		    
	    }
	}
	
	
	if (response_logged) {
	   nextButton_Att.blur();
	    
	    // uncheck radio buttons
	    for (i = 0; i < radio.length; i++) {
		radio[i].checked = false
	    }
	    experiment.next();
	} else {
	    $("#testMessage_att").html('<font color="red">' + 
				   'Please make a response!' + 
				   '</font>');
	}
    },

    
    // The work horse of the sequence - what to do on every trial.
    next: function() {

	// Allow experiment to start if it's a turk worker OR if it's a test run
	if (window.self == window.top | turk.workerId.length > 0) {
	
	    $("#testMessage_att").html(''); 	// clear the test message

	    //showing condition
	    if (page < 1) {
	     	var coinFlip = Math.floor(Math.random()*2+1);

         	if(coinFlip == 1) {
         		showSlide("conditiond");
         		condition = "Divergent";
         	} else { 
         		showSlide("conditionc"); 
		        condition = "Convergent";
		    }
         	page = page + 1;
        } else {

			// $("#testMessage_kno").html(''); 
			$("#progress").attr("style","width:" +
							    String(100 * (1 - (trials.length)/numTrialsExperiment)) + "%")

 			//style="width:progressTotal%"
	    
		    // Get the current trial - <code>shift()</code> removes the first element
		    // select from our scales array and stop exp after we've exhausted all the domains
		    var trial_info = trials.shift();
		    
		    //If the current trial is undefined, call the end function.

		    if (typeof trial_info == "undefined") {
				return experiment.debriefing();
		    }

		

		    // check which trial type you're in and display correct slide
		    if (trial_info.trial_type == "attitudes") {
		    	$("#attitudes").html(trial_info.sentence);  //add sentence to html 
		    	 showSlide("attitudes_slide");              //display slide
		    } 
		    

		    // log the sentence for each trial
			experiment.data.sentence.push(trial_info.sentence);
			experiment.data.trial_type.push(trial_info.trial_type)
			experiment.data.trial_number_block.push(trial_info.trial_number_block)
		}
	}
    },


    //	go to debriefing slide
    debriefing: function() {
	showSlide("debriefing");
    },


    // submitcomments function
    submit_comments: function() {

    var gender = document.getElementsByName("gender");

	// Loop through race buttons
	for (i = 0; i < gender.length; i++) {
	    if (gender[i].checked) {
			experiment.data.gender.push(gender[i].value);	    
	    }
	}

	// Read gender first, then add others to prevent duplication
	if(experiment.data.gender.length == 0) {
    	$('html, body').animate({
        	scrollTop: $(document).height()
    	}, 'slow');
	    $("#debriefMessage").html('<font color="red">' + 
		   'Please select a response for gender!' + 
		   '</font>');

	} else {
		var income = document.getElementsByName("income");
		var political = document.getElementsByName("political");

		for (i = 0; i < income.length; i++) {
		    if (income[i].checked) {
				experiment.data.income.push(income[i].value);	    
		    }
		}

		// Loop through radio buttons
		for (i = 0; i < political.length; i++) {
		    if (political[i].checked) {
				experiment.data.political.push(political[i].value);		    
		    }
		}
		console.log("political after:")
		console.log(experiment.data.political);	

	    experiment.data.age.push(document.getElementById("age").value);
	    experiment.data.education.push(document.getElementById("education").value);
		experiment.data.homelang.push(document.getElementById("homelang").value);
		experiment.data.ethnicity.push(document.getElementById("ethnicity").value);
		experiment.data.expt_aim.push(document.getElementById("expthoughts").value);
		experiment.data.expt_gen.push(document.getElementById("expcomments").value);
		experiment.data.condition.push(condition);

			experiment.end();		
	}

    }
}


