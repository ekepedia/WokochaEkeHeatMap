//
var spreadsheet_key = "1S58McCjHrZ6iNrQ2yKPI9C_3NdZns3Y3W_8-dOgMnIc";
//
//Required to set up isotope.js
//Identifies grid-items, sets layouts, and chooses data to sort
function intialize_Isotope()
{
  $('.grid').isotope(
  {
    itemSelector: '.grid-item',
    percentPosition: true,
	layoutMode: 'packery',
	packery: 
	{
	  gutter: 10
	},
    getSortData: 
    {
      name: '.name',
      size: '.size'
    },
  });
};
//
//Required to set up filtering in isotope.js
//Connects to buttons to the filtering functions in isotope.js
//Also set ups controls for which button is active
function set_up_filters() 
{
	var filters = {};
	//
	$('.filters').on( 'click', 'button', function() {
		var $this = $(this);
	    // 
	    var filterGroup = $this.parents('.button-group').attr('data-filter-group');
	    filters[ filterGroup ] = $this.attr('data-filter');
	    //
	    var filterValue = concatValues( filters );
	    //
	    $(".grid").isotope({ filter: filterValue });
	});
	//
	$('.button-group').each( function( i, buttonGroup ) {
	    var $buttonGroup = $( buttonGroup );
	    $buttonGroup.on( 'click', '.button', function() {
	      $buttonGroup.find('.btn-success').removeClass('btn-success');
	      $( this ).addClass('btn-success');
	    });
	  });
	//
};
//
//Required to set up sorting function of isotope.js
//Connects buttons to sorts
function set_up_sorts()
{
	$('.sort-by-button-group').on( 'click', 'button', function() {
	   	 var sortValue = $(this).attr('data-sort-value');
	    $(".grid").isotope({ sortBy: sortValue });
	  });
};
//
//Sets up angujar.js app
var app = angular.module('heat_map_app', []);
//
//This service is used to retrive data from the spreadsheet using asynchronous calls
app.service("technologyService", function ($q)
{
	var deferred = $q.defer();
	//
	function whenDone(data, tabletop)
	{
		deferred.resolve(data);
	};
	//
	Tabletop.init(
	{ 
		key: spreadsheet_key,
	    callback: whenDone,
        simpleSheet: true 
    });
	//
	this.getTechnologies = function ()
	{
		return deferred.promise;
	}
});
//
//Controller that controls the grid
app.controller('heat_map_controller', function($scope, technologyService)
{
		//
       	$scope.technologies = [];
       	//
        var promise = technologyService.getTechnologies();
        //
		promise.then(function (data)
		{
			$scope.technologies = [];
			//
			for( var i = 0; i < data.length ; i++)
			{
				//
				//takes raw data from spreadsheet and converts it to javaScript object
				var new_tech = new_technology
				(
					data[i]["Technologies"].trim(),
					data[i]["Crowd-Ready? (Y/N/NA/ND)"].trim(),
					data[i]["TC Community ready? (1 = VERY, 5 = Not possible)"].trim(),
					data[i]["Should we sell? (Yes/No/With Care)"].trim(),
					data[i]["Technology Type"].trim(),
					data[i]["Notes"].trim()
				);
				//
				$scope.technologies.push(new_tech);
				//
			};
			//
			//Converts all javaScript objects to tiles with html
			for( var i = 0 ; i < $scope.technologies.length ; i++)
			{
				$(".grid").isotope('insert', technology_html($scope.technologies[i]));
			}
			//
			$("#loading_screen").remove();
			
		});
});
//
//Convert data from spreadsheet into clean javaScript object
//@@return: a javaScript object
//@@params:
//in_name : - string - of the name of the technoloy
//in_crowd_ready : - string - whether or not the technology is ready for the crowd
//in_community_ready : - string - a level (1-5) that says how the technology is ready for topcoder
//in_to_sell : - string - whether or not the technology should be sold
//in_type : - string - the type of technology
//in_notes : - string - any noles about the technology
function new_technology (in_name, in_crowd_ready, in_community_ready, in_to_sell, in_type, in_notes)
{
	var new_tech = {
		name: in_name,
		crowd_ready: in_crowd_ready,
		community_ready: in_community_ready,
		to_sell: in_to_sell,
		type: (in_type || "No Type."),
		notes: (in_notes || "No notes.")
	};
	return new_tech
}
//
//Converts the technology javaScript object into a tile, which is an html element
//@@return: an html element
//@@params:
//technology : - javaScript object - a javaScript object from the new_technology function
function technology_html (technology)
{
	var id = technology.name
	var size = "size-" + technology.community_ready;
	var element = $("<div id = " + id + "> </div>");
	var type = shorter(technology.type)
	element
		.addClass("grid-item")
		.addClass(size)
		.addClass(type);
	element
		.append("<p class='name'>" + id + "</p>")
		.append("<p class = 'type'>" + type + "</p>")
		.append("<div class = 'hidden size'>" + technology.community_ready + "</div>");
	return element;
}
//
//Combines an array filter values into one filter value so that isotope.js can use multiple filters
//@@return: a string 
//@@params:
//obj : - array of strings - an array of classes to be filters
function concatValues( obj )
{
  var value = '';
  for ( var prop in obj ) {
    value += obj[ prop ];
  }
  return value;
}
//
//Makes sure that the technology type string only contains the text before the "/"
//Ex: "Framework/Library" turns into "Framework"
//@@return: a string
//@@params: str : - string - the technology type
function shorter( str ) 
{
	var index = str.indexOf("/");
	//
	if (index != -1)
	{
		str = str.substring(0,index);
	}
	return str;
}
//