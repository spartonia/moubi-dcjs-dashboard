
var formatter = d3.format(".2f");

var seChart = dc.geoChoroplethChart("#se-chart");
var ageChart = dc.barChart("#age-chart");
var genderChart = dc.pieChart('#gender-chart');
var statusChart = dc.pieChart("#status-chart");
var incomeClassChart = dc.rowChart("#income-class-chart");
var visCount = dc.dataCount("#data-table-count");
var visTable = dc.dataTable("#data-table");

d3.csv("./static/data/moubi.csv", function(err, csv){
  // City,CloseDate,EntityIDRoundID,IndustryCode,Industry Group,Industry Segment,Metropolitan Statistical Area,PrimaryRegion,RoundBusStat,RoundClassDescr,State,Subregion,Deals,Number of Deals,Raised
  // Mountain View,1/1/2011,6.12834E+11,Database Software,Information Technology,Software,"San Jose-Sunnyvale-Santa Clara, CA",Northern California,Generating Revenue,First Round,CA,San Francisco Bay Area,1,1,2
  if (err) throw err;

  var data = crossfilter(csv);
  var all = data.groupAll();

  var states = data.dimension(function (d){
    return d["FBF_LANKOD"].toString();
  });
  var stateRaisedSum = states.group().reduceCount();

  var genderDim = data.dimension(function (d){
    switch(d.KON){
      case "m":
      case "M":
        return "Male";
      case "k":
      case "K":
        return "Female";
      default:
        return "Not Specified";
    }
  });
  var genderGroup = genderDim.group();

  var statusDim = data.dimension(function (d){
    return d.STATUS;
    // switch (d.STATUS){
    //   case 0:
    //   case "0":
    //     return "OK";
    //   case 1:
    //   case "1":
    //     return "Defalted"
    //   default:
    //     return "N/A";
    // }
  })
  var statusGroup = statusDim.group();

  var incomeClassDim = data.dimension(function (d){
    return d.INKOMSTKLASS ? d.INKOMSTKLASS : "N/A";
  })
  var incomeClassGroup = incomeClassDim.group();

  var ageDim = data.dimension(function (d){
    return d.ALDER ? d.ALDER : "N/A";
  })
  var ageGroup = ageDim.group();


  // ##### Map charts
  d3.json("./static/data/swedish_provinces.geojson", function(err, statesJson){
    if (err) throw err;

    //Width and height
    var width = 300;
    var height = 600;
    
    var projection = d3.geo.mercator()
       .scale(1)
       .translate([0, 0])
       ;
    var path = d3.geo.path().projection(projection);
    var b = path.bounds(statesJson);
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);
    seChart
      .width(width)
      .height(height)
      .dimension(states)
      .group(stateRaisedSum)
      .projection(projection)
      .colors(d3.scale.linear().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([0, 150])
      .colorCalculator(function(d){
        return d ? seChart.colors()(d) : '#ccc';})
      .overlayGeoJson(statesJson.features, "someName", function(d){
        return d.properties.l_id.toString();})
      .valueAccessor(function(kv){
        console.log(kv);
        return kv.value;})
      .title(function(d){
        return "State: " + d.key + "\nTotal loans: " + d.value
      })
      ;
    dc.renderAll();
  });
  
  // ###### Pie/Donut charts 

  // gender chart
  genderChart
    // .width(180)
    // .height(180)
    .radius(80)
    .dimension(genderDim)
    .group(genderGroup)
    .label(function (d){
      if (genderChart.hasFilter() && !genderChart.hasFilter(d.key)){
        return d.key + '(0%)';
      }
      var label = d.key;
      if (all.value()){
        // console.log(all.value(), d.value);
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    })
    .renderLabel(true)
    // .innerRadius(40)
    // .transitionDuration(500)
    .colors(d3.scale.ordinal().range(['#FFBD11', '#F7A695']))
    .colorDomain([-1750, 1644])
    .colorAccessor(function(d, i){return d.value;})
    ;

  statusChart
    .radius(80)
    .innerRadius(30)
    .dimension(statusDim)
    .group(statusGroup)
    .colors(d3.scale.category20())
    .label(function (d){
      if (statusChart.hasFilter() && !statusChart.hasFilter(d.key)){
        return d.key + '(0%)';
      }
      var label = d.key;
      if (all.value()){
        // console.log(all.value(), d.value);
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    })
    .renderLabel(true)
    ;

  // Data tables and counts 

  visCount
    .dimension(data)
    .group(all)
    ;

  visTable
    .dimension(statusDim)
    .group(function (d){
      return d.INKOMSTKLASS;
    })
    .columns([
      "ID",
      "STATUS",
      "POSTORT",
      "ALDER",
      "KON",
      "ALDER",
      "BETALNING_HISTORIK",
      "INKOMSTKLASS"
      ])
    .size(25)
    ;

  // Income chart
  incomeClassChart
    .width(350)
    .height(600)
    .dimension(incomeClassDim)
    .group(incomeClassGroup)
    // .y(d3.scale.log().domain([.5, 1000000]))
    .elasticX(true)
    .title(function (d){
      return "Income class: " + d.key + "\nTotal count:" + d.value
    })
    .data(function (group){
      return group.top(20);
    })
    // .xAxisLabel("Count")  // does not supported for rowChart
    // .yAxisLabel("Income Class")
    .xAxis().ticks(6)
    ;

  // Age chart 
  ageChart
    .width(900)
    .height(250)
    .margins({top: 30, right: 20, bottom: 30, left: 40})
    .dimension(ageDim)
    .group(ageGroup)
    .elasticY(true)
    .centerBar(false)
    .gap(1) // default = 2
    .round(dc.round.floor)
    .alwaysUseRounding(true)
    .x(d3.scale.linear().domain([10, 100])) // min max age 
    .renderHorizontalGridLines(true)
    .xAxisLabel("Age") 
    .yAxisLabel("Count") 
    ;

  dc.renderAll();
});