// set the dimensions and margins of the graph
//TODO: sort out left margin of graph
let margin = {top: 40, right: 60, bottom: 10, left: 90},
  width = 1400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;


//Define variables
var lines;
var dimensions;
var highlighted = null; 

  //tooltip div
  var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

  //Detail
  d3.select("body").append("h2")	
    .text("Alias")
    .style("display", "none");
  var alias = d3.select("body").append("p")	
    .attr("class", "Alias")
    .style("display", "none");

  // d3.select("body").append("h2")	
  //   .text("Interests")
  //   .style("display", "none");
  // var interests = d3.select("body").append("p")	
  //   .attr("class", "Interests")
  //   .style("display", "none");

  d3.select("body").append("h2")	
    .text("Expectations")
    .style("display", "none");
  var expectations = d3.select("body").append("p")		
    .attr("class", "Expectations")
    .style("display", "none");

    
// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



// For each dimension, I build a linear scale. I store all in a y object
var y = {}
// Build the X scale -> it find the best position for each Y axis
x = d3.scalePoint()
  .range([0, width])


// Parse the Data
d3.csv("student_data.csv", function(data) {

  const column_list = []
  /* get skills from data col 11 to 22 */
  for (let i = 0; i <= 11; i++) {
  column_list[i] = data.columns[i + 11]
}

  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return column_list.indexOf(d) >= 0 && (y[d] = d3.scaleLinear()
        .domain([0,10])
        .range([height, 0]));
  }));

  // Color scale
  //TODO: mixed majors are added + mixed majors are not filtered
  const color = d3.scaleOrdinal()
  .domain([
    "Media Technology",
    "Computer Science",
    "Computer Science, Media Technology",
    "Human-Computer Interaction",
    "Computer Science, Human-Computer Interaction, Media Technology",
    "Human-Computer Interaction, Media Technology",
    "Human-Computer Interaction, Media Technology, Graphic Design, Marketing",
    "Business Administration, Finance, Law, Economics"
  ])
  .range([
    "#8931ef",
    "#ff00bd",
    "#e11845",
    "#f2ca19",
    "#6e2c00",
    "#f57f17",
    "#1b4f72",
    "#0057e9"
  ])


  // Add lines for hover and highlight.
  foreground = svg.append("g")
    .attr("class", "foreground")
   .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .style("opacity", "0.3")
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
          .style("opacity", "0.3")	
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
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(10).scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black");

 
  //Apply the brush filter function
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

  /*--------function define--------*/

  //  onclick
  function equalToEventTarget() {
    return this == d3.event.target;
  }
  
  d3.select("body").on("click", function(){
    var outside = d3.selectAll("path").filter(equalToEventTarget).empty();
    if (outside && highlighted!=null){
      lowlight();
    }
  
  });
    
    
  //lowlight function
  function lowlight() {
    highlighted.style("stroke-width", "3px").style("stroke",function(d){ return( color(d.Major))}).style("opacity","0.3");
    highlighted=null;
    d3.select("body").selectAll("h2").style("display", "none");
    d3.select("body").selectAll("p.Alias")
    .text("")
    .style("display", "none");
    // d3.select("body").selectAll("p.Interests")
    // 		.text("")
    // 		.style("display", "none");
    	d3.select("body").selectAll("p.Expectations")
    		.text("")
    		.style("display", "none");
  
  }

  //highlight function
  function highlight(d) {
    if (highlighted!=null){
      lowlight();
    }
    d3.select(this).attr("d", path).style("stroke-width", "12px").style("opacity", "1");
    highlighted=d3.select(this).attr("d", path).style("stroke", function(d){ return( color(d.Major))} );
    d3.select("body").selectAll("h2").style("display", "block");
    d3.select("body").selectAll("p.Alias")
    	.text(d.Alias)
    	.style("display", "block");
    // d3.select("body").selectAll("p.Interests")
    // 	.text(d.Interests)
    // 	.style("display", "block");
    d3.select("body").selectAll("p.Expectations")
    	.text(d.Expectations)
    	.style("display", "block");
  }

})


/*--------function define--------*/

// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

//brush function allows to filter out the lines in certain range
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
