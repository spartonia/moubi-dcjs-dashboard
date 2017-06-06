/////////////////////////////////
//  Map Section                //
/////////////////////////////////

var formatter = d3.format(".2f");

var seChart = dc.geoChoroplethChart("#se-chart");

d3.csv("moubi.csv", function(err, csv){
  // City,CloseDate,EntityIDRoundID,IndustryCode,Industry Group,Industry Segment,Metropolitan Statistical Area,PrimaryRegion,RoundBusStat,RoundClassDescr,State,Subregion,Deals,Number of Deals,Raised
  // Mountain View,1/1/2011,6.12834E+11,Database Software,Information Technology,Software,"San Jose-Sunnyvale-Santa Clara, CA",Northern California,Generating Revenue,First Round,CA,San Francisco Bay Area,1,1,2
  if (err) throw err;

  var data = crossfilter(csv);
  var all2 = data.groupAll();

  var states = data.dimension(function(d){
    return d["FBF_LANKOD"].toString();
  });
  var stateRaisedSum = states.group().reduceCount();

  // var industries = data.dimension(function(d){
  //   return d["Industry Group"];
  // });
  // var statsByIndustries = industries.group().reduce(
  //   function(p, v){  // reduceAdd(p, v)
  //     p.amountRaised += +v["Raised"];
  //     p.deals += +v["Deals"];
  //     return p;
  //   },
  //   function(p, v){  // reduceRemove(p, v)
  //     p.amountRaised -= +v["Raised"];
  //     if (p.amountRaised < 0.001) p.amountRaised = 0; // do some clean up 
  //     p.deals -= +v["Deals"];
  //     return p;
  //   },
  //   function(){  // reduceInitial()
  //     return {amountRaised: 0, deals: 0};
  //   }
  // );

  // var rounds = data.dimension(function(d){
  //   return d["RoundClassDescr"];
  // });
  // var statsByRound = rounds.group().reduce(
  //   function(p, v){  // reduceAdd(p, v)
  //     p.amountRaised += +v["Raised"];
  //     p.deals += +v["Deals"];
  //     return p;
  //   },
  //   function(p, v){  // reduceRemove(p, v)
  //     p.amountRaised -= +v["Raised"];
  //     if (p.amountRaised < 0.001) p.amountRaised = 0; // do some clean up 
  //     p.deals -= +v["Deals"];
  //     return p;
  //   },
  //   function(){  // reduceInitial()
  //     return {amountRaised: 0, deals: 0};
  //   }
  // );

  d3.json("swedish_provinces.geojson", function(err, statesJson){
    if (err) throw err;

    //Width and height
    var width = 400;
    var height = 800;
    
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
      });
    dc.renderAll();
  });
});