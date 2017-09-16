const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json"
const mapurl = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
const margin = {top: 0, right: 0, bottom: 0, left: 0}
let width = window.innerWidth*.85-margin.left-margin.right,
    height = window.innerHeight*.85-margin.top-margin.bottom,
    scale0 = (width - 1) / 2 / Math.PI;
let standardFontSize = Math.pow((Math.pow(width,2)+Math.pow(height,2)),0.5)*0.01
let toolTipDiv = d3.select("body").append("div")//toolTip div definition, definition in css sheet would not work for me???
            .attr("class", "toolTip")
            .style("position", "absolute")
            .style("padding", "5px")
            .style("color", "white")
            .style("background-color", "black")
            .style("font-size", "12px")
            .style("border-radius", "3px")
            .style("text-align", "center")
            .style("visibility", "hidden");

let chart = d3.select(".chart")//main chart definition
    .attr("width", width + margin.left + margin.right)//margins added for axis
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.zoom().on("zoom", zoomed))
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let radius = d3.scaleSqrt()
    .domain([0, 1e6])
    .range([0, 15]);


d3.json(url,function(error,meteorData){//use d3's own json capabilites to get data
    if (error) throw error;
    let transposedMeteorData = meteorData.features.map(function(d,i){
      let tArr =[]
      let latLongArr = []
      let descArr =[]
      let descObj ={}
      if(!d.geometry){//no geometry means no lat/long
        tArr.push(null)
        return tArr;
      }
      //lat long
      latLongArr.push(parseFloat(d.properties.reclong))
      latLongArr.push(parseFloat(d.properties.reclat))
      tArr.push(latLongArr)
      //mass
      tArr.push(parseFloat(d.properties.mass))
      //description
      descObj.fall = d.properties.fall
      descObj.mass = d.properties.mass
      descObj.name = d.properties.name
      descObj.nametype = d.properties.nametype
      descObj.recclass = d.properties.recclass
      descObj.year = new Date(d.properties.year).getFullYear()
      descObj.originalIndex = i

      tArr.push(descObj)
      return tArr;
    })
    transposedMeteorData = transposedMeteorData.filter(function(d){if(d[0]){return d}})
    transposedMeteorData.sort(function(a,b){return b[1] - a[1];});

    insertGlobalMap(transposedMeteorData)

})

function insertGlobalMap(mData){
  console.log(mData)
  let projection = d3.geoMercator()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 1.5])

  let path = d3.geoPath()
    .projection(projection);



  let globe = chart.append("path")
      .attr("d", path(worldMapData))
      .attr("fill","white")
  let fakeData = [[ -77.03637,38.89511],[38.763611,9.005401],[-4.024429,5.345317]]

  let pointPlots = chart.selectAll("g")
      .data(mData)
      .enter().append("circle")
      .attr("cx",function(d){return projection(d[0])[0]})
      .attr("cy",function(d){return projection(d[0])[1]})
      .attr("r",function(d){
        if(!d[1]){return 1}
        else {return radius(d[1])}
      })
      .attr("fill",getRandomColor)
      .style("opacity",".5")
      .on("mouseover", function(d) {//tool tip functionality
         toolTipDiv.html("<strong>"+d[2].name +" : " + d[2].year +"</strong><br/>"
                          + " mass: " + d[2].mass)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY+10) + "px")
           .style("visibility", "visible");
         })
       .on("mouseout", function(d) {
         toolTipDiv.style("visibility", "hidden");
         });
}

function zoomed(){
  console.log(d3.event.scale)
  chart.attr("transform", d3.event.transform)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  if (color!=="#FFFFFF"){return color;}
  else{getRandomColor()}
}
