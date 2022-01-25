<!-- Code from d3-graph-gallery.com -->

// set the dimensions and margins of the graph

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
  8 majors, 8 colors, 55 ≈ 35% opacity.
  Red, blue and yellow. Avoid green for color blindness
  TODO predefine colors as a list/dict.
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
    "#8931ef55",
    "#ff00bd55",
    "#e1184555",
    "#f2ca1955",
    "#6e2c0055",
    "#f57f1755",
    "#1b4f7255",
    "#0057e955"
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


// append the svg object to the body of the page
let svg = d3.select("#nice_viz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


// Parse the data from csv file. total 44 students
// column 11 -22 (starts with 0)
d3.csv("student_data.csv", function(error, data) {
  if (error) throw error;
  console.log(data)

  const dimensions = []
  /* get skills from data col 11 to 22 */
  for (let i = 0; i <= 11; i++) {
    dimensions[i] = data.columns[i + 11]
  }

  // For each dimension, a linear scale. Stored in a y object
  let y = {}
  for (i in dimensions) {
    skill = dimensions[i]
    y[skill] = d3.scaleLinear()
      .domain([1, 10]) // --> Same axis range for each group
      // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

  // Highlight the Major that is hovered
  let highlight = function(d) {

    sel_major = d.Major

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "lightgrey")
      .style("opacity", "0.2")
    // Second the hovered specie takes its color

    //This does not seem to work
    d3.selectAll("." + sel_major)
      .transition().duration(200)
      .style("stroke", color(sel_major))
      .style("opacity", "1")
    //this info could be displayed
    console.log(sel_major + " : " + color(sel_major));

  }

  // Unhighlight
  let doNotHighlight = function(d) {
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", function(d) {
        return (color(d.Major))
      })
      .style("opacity", "1")
  }

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) {
      return [x(p), y[p](d[p])];
    }));
  }

  // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("class", function(d) {
      return "line " + d.Major
    }) // 2 class for each line: 'line' and the group name
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function(d) {
      return (color(d.Major))
    })
    .style("opacity", 0.5)
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight )



  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // translate this element to its right position on the x axis
    .attr("transform", function(d) {
      return "translate(" + x(d) + ")";
    })
    // And I build the axis with the call function
    .each(function(d) {
      d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) {
      return d;
    })
    .style("fill", "black")

})
