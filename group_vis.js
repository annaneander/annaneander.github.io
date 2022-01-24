// set the dimensions and margins of the graph
//TODO: sort out left margin of graph
let margin = {top: 40, right: 70, bottom: 10, left: 70},
  width = 1260 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var background,
    foreground;

var dimensions;

var highlighted = null; 

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    
// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// Here I set the list of dimension manually to control the order of axis:
//   dimensions =
//   ["Information Visualization",
//   "Statistics",
//   "Mathematics",
//   "Drawing and Art",
//   "Computer Usage",
//   "Programming",
//   "Graphics Programming",
//   "HCI",
//   "UX",
//   "Communication",
//   "Collaboration",
//   "Code Repository",
//  ]


// For each dimension, I build a linear scale. I store all in a y object
var y = {}
// Build the X scale -> it find the best position for each Y axis
x = d3.scalePoint()
  .range([0, width])


// Parse the Data
d3.csv("new_data.csv", function(data) {

  // for (i in dimensions) {
  //   name = dimensions[i]
  //   y[name] = d3.scaleLinear()
  //     .domain( [0,10] ) // --> Same axis range for each group
  //     // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
  //     .range([height, 0])
  // }

  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
  	var column_list = 
        ["Information Visualization",
              "Statistics",
              "Mathematics",
              "Drawing and Art",
              "Computer Usage",
              "Programming",
              "Graphics Programming",
              "HCI",
              "UX",
              "Communication",
              "Collaboration",
              "Code Repository",
            ];
    return column_list.indexOf(d) >= 0 && (y[d] = d3.scaleLinear()
        .domain([0,10])
        .range([height, 0]));

  }));

  // Color scale: give me a specie name, I return a color
  //TODO: not all mixed majors are added + mixed majors are not filtered
  // //just random colors for now
  let color = d3.scaleOrdinal()
    .domain(["Media Technology", "Computer Science", "Human-Computer Interaction", "Computer Engineering", "Finance" ])
    .range([ "#440154ff", "#21908dff", "#fde725ff","#21908000","#ddd08dff" ])


  // // Highlight the Major that is hovered
  // var highlight = function(d){

  //   selected_specie = d.Major

  //   // first every group turns grey
  //   d3.selectAll(".line")
  //     .transition().duration(200)
  //     .style("stroke", "lightgrey")
  //     .style("opacity", "0.2")
  //   // Second the hovered specie takes its color

  //   //This does not seem to work
  //   d3.selectAll("." + selected_specie)
  //     .transition().duration(200)
  //     .style("stroke", color(selected_specie))
  //     .style("opacity", "1")
  //     //this info could be displayed
  //     console.log(selected_specie +" : "+ color(selected_specie));

  // }

  // // Unhighlight
  // var doNotHighlight = function(d){
  //   d3.selectAll(".line")
  //     .transition().duration(200).delay(1000)
  //     .style("stroke", function(d){ return( color(d.Major))} )
  //     .style("opacity", "1")
  // }

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
    .attr("class", "foreground")
   .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .style("opacity", "0.2")
    .style("stroke", function(d){ return( color(d.Major))})
    // .style("stroke", "lightgrey")
    .on("mouseover", function(d) {
      d3.select(this).attr("d", path)
        if (highlighted==null){
          d3.select(this).attr("d", path).style("stroke-width", "9px").style("opacity", "0.8")
          .style("stroke", function(d){ return( color(d.Major))} )
        }
        div.transition()		
          .duration(200)		
          .style("opacity", .9);		
        div.html(d.Alias + "<br/>"  + d.Major)	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
  })					
    .on("mouseout", function(d) {	
        if (highlighted==null){
          d3.select(this).attr("d", path).style("stroke-width", "3px")
          .style("opacity", "0.2")	
          .style("stroke", function(d){ return( color(d.Major))})
          // .style("stroke", "lightgrey")
        }
        div.transition()		
          .duration(500)		
          .style("opacity", 0);	
    })
    .on("click", highlight);



  // Draw the axis:
  g= svg.selectAll(".dimension")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

    // And I build the axis with the call function
    g.append("g")
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black");

 

    g.append("g")
    .attr("class", "brush")
    .each(function (d) {
        d3.select(this).call(y[d].brush = d3.brushY()
            .extent([[-10, 0], [10, height]])
            .on("start", brushstart)
            .on("brush", brush)
            .on("end", brush));
    })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);



    function equalToEventTarget() {
      return this == d3.event.target;
    }
    
    d3.select("body").on("click", function(){
      var outside = d3.selectAll("path").filter(equalToEventTarget).empty();
      if (outside && highlighted!=null){
        lowlight();
      }
    
    });
    
    
    
    function lowlight() {
      highlighted.style("stroke-width", "3px").style("stroke",function(d){ return( color(d.Major))}).style("opacity","0.2");
      highlighted=null;
      // d3.select("body").selectAll("h2").style("display", "none");
      // d3.select("body").selectAll("p.interests")
      // 		.text("")
      // 		.style("display", "none");
      // 	d3.select("body").selectAll("p.learn")
      // 		.text("")
      // 		.style("display", "none");
    
    }

  function highlight(d) {
    if (highlighted!=null){
      lowlight();
    }
    d3.select(this).attr("d", path).style("stroke-width", "13px").style("opacity", "1");
    highlighted=d3.select(this).attr("d", path).style("stroke", function(d){ return( color(d.Major))} );
    // d3.select("body").selectAll("h2").style("display", "block");
    // d3.select("body").selectAll("p.interests")
    // 	.text(d.interests)
    // 	.style("display", "block");
    // d3.select("body").selectAll("p.learn")
    // 	.text(d.learn)
    // 	.style("display", "block");
  }

})



// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}


function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

function brush() {
  // Get a set of dimensions with active brushes and their current extent.
  var actives = [];
  svg.selectAll(".brush")
      .filter(function (d) {
          // console.log(d3.brushSelection(this));
          return d3.brushSelection(this);
      })
      .each(function (key) {
          actives.push({
              dimension: key,
              extent: d3.brushSelection(this)
          });
      });
  // Change line visibility based on brush extent.
  if (actives.length === 0) {
      foreground.style("display", null);
  } else {
      foreground.style("display", function (d) {
          return actives.every(function (brushObj) {
              return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension]) && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
          }) ? null : "none";
      });

    }}
