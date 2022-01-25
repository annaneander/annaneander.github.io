
//<!-- Code from d3-graph-gallery.com -->

// set dimensions and margins of the graph
//TODO: sort out sizes according to viewport
const margin = {
    top: 40,
    right: 70,
    bottom: 10,
    left: 70
  },
  width = 1300 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;


/*
  8 majors, 8 colors. Red, blue and yellow. Avoid green for color blindness. TODO predefine colors as a list/dict.
*/
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

  /*
    Name: Blue-Violet Hex: #8931ef
    Name: Shocking Pink Hex: #ff00bd
    Name: Spanish Crimson Hex: #e11845
    Name: Jonquil (yellow) Hex: #f2ca19
    #6e2c00 //brown
    #f57f17 //orange
    #1b4f72 //blue-black
    Name: RYB Blue Hex: #0057e9
    Name: Alien Armpit  Hex: #87e911   GREEN DO NOT USE
  */

  //tooltip div
  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


// append the svg object to the body of the page
let paracord = d3.select("#nice_viz")
  .append("svg")
  .style("background-color", "#fefefa") //maybe a good idea??
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",

        "translate(" + margin.left + "," + margin.top + ")");


// append another svg to bottom for pie chart
let svg_sum = d3.select("#summary")
  .append("svg")
  .style("background-color", "#fefefa")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height - 200 + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


  // For each dimension, I build a linear scale. I store all in a y object
  let y = {}
  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])


// Parse the data from csv file. total 44 students
// column 11 -22 (starts with 0)
//d3.csv("student_data.csv").then(data => {
d3.csv("student_data.csv", (error, data) => {
  if (error) throw error;
  console.log(data)

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


  // Highlight the student that is hovered
  let highlighthover = function(d) {
    sel_alias = d.Alias
    sel_major = d.Major
    //console.log(sel_alias + " : " + sel_major + " : " + color(sel_major));

    // first every group turns grey
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .style("stroke", "lightgrey")
      .style("stroke-width", "2px")
      .style("opacity", "0.2")

    // Second the hovered alias gets color back
    //let a= d3.selectAll("." + sel_major)
    let a = d3.select("#" + sel_alias);
    // console.log(a);
    a.transition()
    .duration(200)
      .style("stroke", color(d.Major))
      .style("opacity", "0.9")
      .style("stroke-width","6px")

    //this info could be displayed
    d3.select(this).attr("d", path)
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.Alias + "<br/>"  + d.Major)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
  }


  // Unhighlight
  let doNotHighlighthover = function(d) {
    d3.selectAll(".line")
    .transition()
    .duration(500)
    .delay(500)
    .style("stroke", function(d) {
      return (color(d.Major))
    })
    .style("stroke-width", "2px")
    .style("opacity", "0.3")

      div.transition()
        .duration(500)
        .style("opacity", 0);
  }


  // Add lines for hover and highlight.
  foreground = paracord.append("g")
    .attr("class", "foreground")
   .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("id", d => d.Alias)
    // 2 classes for each line: 'line' and the group name
    .attr("class", d => "line " + d.Major)
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", d => color(d.Major))
    .style("opacity", "0.3")
    .on("mouseover", highlighthover)
    .on("mouseout", doNotHighlighthover)



  // Draw the axis:
  g= paracord.selectAll(".dimension")
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
  paracord.selectAll(".brush")
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
