/**
 * util.js with configuration
 * Created by Han Wang on 8/1/2017.
 */

var title = ["Pair","ID","FFreq","First name","Last name","LFreq","DoB(M/D/Y)","Sex","Race","ID."];
var cwidth = [60,150,60,150,150,150,125,60,60,80]; //870
var height = 24; //height per row 0 30 57
var ys = [0,30,77];
var data = {}; // experimentr data
var n_pair = 0;
var s2_n_pair = 0;

var mapping = [0,9,2,10,11,5,12,13,14,1,3,4,6,7,8,15];

//id
var i_mapping = [1,9];
//first name
var fn_mapping = [3,10];
//last name
var ln_mapping = [4,11];
//dob
var d_mapping = [6,12];
//gender
var g_mapping = [7,13];
//race
var r_mapping = [8,14];


function cell(t,g,j){
    var index_r = g.attr("id").slice(1)%6, //pair index on page
        x = 40*(j%cwidth.length)+cwidth.slice(0,j%cwidth.length).reduce((a, b) => a + b, 0),
        y = index_r==0&&j>=cwidth.length ? ys[Math.floor(j/cwidth.length)]+20 : ys[Math.floor(j/cwidth.length)],
        cx = cwidth[j%cwidth.length],
        cy = height,
        cel = g.append("g").attr("id","c"+j.toString()).attr("class","cell")
            .attr("transform","translate("+x+","+y+")");

    if(index_r==0 && j<cwidth.length){
        rectangle.attr("x",0).attr("y",0).attr("width",cx+40).attr("id","r"+j.toString())
            .attr("height",function(){if(j==cwidth.length){return cy*2+23;}if(k==0||k==5||(index_r>0 && j<cwidth.length)){return 0;}return cy;})
            .style("fill","none")
            .style("fill",function(){if(k==1||k==2){return "#add8e6";}if(k==3||k==4){return "#b2d3e6";}})
            .style("opacity",1);
    }
}

/**
 * draw a row
 * @param t: text
 * @param g: svg
 * @param j: row number 0/1/2
 */
function row(t,g,j){
    var l = 0;
    for(var i=0;i<cwidth.length;i++){
        cell(t[i],g,j*cwidth.length+l,t[mapping[i]]);
        l+=1;
    }
}

/**
 * draw a pair
 * @param t: text
 * @param g: svg
 */
function pair(t,g){
    var a = cwidth.length,
        b = cwidth.length + mapping.length,
        c = cwidth.length + 2*mapping.length,
        row1 = t.slice(a,b),
        row2 = t.slice(b,c);
    row(row1, g, 1);
    row(row2, g, 2);
}

/**
 * draw several pairs
 * @param s: (string) session e.g. practice, mat,
 * @param step (int)
 */
function pairs(s,step){
    var t = experimentr.data()[s][step],
        n = t.length;
    for(var i=0;i<n;i++){
        var g = d3.select("#table").append("svg")
            .attr("class","blocks")
            .attr("id","g"+(s*6+i).toString())
            .attr("width", 1800)
            .attr("height", function(){
                if(i==0){
                    //room for title
                    return 140;
                }
                return 120;
            });
        t[i][0] = t[i][0].slice(0,t[i][0].length-2);
        t[i][1] = t[i][1].slice(0,t[i][1].length-2);
        pair(title.concat(t[i][0]).concat(t[i][1]),g,m);
        if(i==0){
            choices(g,1450,1,1,40);
            var panel = g.append("g")
                .attr("id","panel")
                .attr("transform","translate(1350,0)");
            var re = panel.append("rect")
                .attr("x",-20)
                .attr("height",24)
                .attr("width",570)
                .style("fill","add8e6");
            var te = panel.append("text")
                .attr("x",170)
                .attr("y",17)
                .text("Choice Panel")
                .style("font",function(){
                    if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}
                    if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}
                    return "16px Lucida Console";})
                .style("font-weight","bold")
                .attr("text-anchor","left")
                .attr("fill","black");
        }else{
            choices(g,1450,1,1,20);
        }
    }
}

function choices(svg, lBound, scale, mode, yt) {
    var options = ["Highly Likely Different",
        "Moderately Likely Different",
        "Less Likely Different",
        "Less Likely Same",
        "Moderately Likely Same",
        "Highly Likely Same"];
    var x = [20, 60, 100, 140, 180, 220];
    var lx = [10, 20, 38, 60, 78, 100, 118, 140, 158, 180, 198, 220, 238, 250];
    var y = 37;
    // add buttons
    var buttons = svg.append("g").attr("transform", "translate(" + lBound + ","+yt+")").attr("class","choice_panel");
    //buttons.append("rect").attr("x",-10*scale).attr("y",0).attr("width",280*scale).attr("height",85*scale).style("fill","#68a7ca").style("opacity",1);
    if(mode!=2){
        buttons.append("text").attr("x", 220 * scale).attr("y", 78 * scale).text("Same").attr("text-anchor", "middle").style("font", 16 * scale + "px sans-serif").attr("id","lbl_same");
        buttons.append("text").attr("x", 50 * scale).attr("y", 78 * scale).text("Different").attr("text-anchor", "middle").style("font", 16 * scale + "px sans-serif").attr("id","lbl_diff");
    }
    for (var p = 0; p < options.length; p++) {
        buttons.append("text").attr("id","labelText"+p.toString())
            .attr("x", (x[p] + 8) * scale).attr("y", function(){if(mode==2 && p%2==1){return 66*scale;}return 30 * scale;})
            .text(function(){if(mode==2){return options[p];}return options[p][0];})
            .attr("text-anchor", "middle").style("font", function(){if(mode==2){return 14+"px sans-serif";}return 16 * scale + "px sans-serif";});
    }
    //arrows
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");
    for(var pos=0;pos<7;pos++){
        var lineData = [{"x": lx[2*pos]*scale, "y": 44*scale+4*(scale-1)}, {"x": lx[2*pos+1]*scale, "y": 44*scale+4*(scale-1)}];

        buttons.append("path").attr("d", lineFunction(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .style("fill","none");
    }
    // separator
    if(mode==1){
        var separator = [{"x":130, "y":32},{"x":130,"y":55}];
        buttons.append("path").attr("d",lineFunction(separator)).attr("stroke", "black").attr("stroke-width", 3).style("fill","none");
    }

    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var leftTrianglePoints = xScale(0) + ' ' + yScale(48*scale-4) + ', ' + xScale(10*scale) + ' ' + yScale(42*scale-4) +
        ', ' + xScale(10*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(10*scale) + ', ' + yScale(54*scale-4) + ' ' +
        xScale(0) + ' ' + yScale(48*scale-4);
    var rightTrianglePoints = xScale(260*scale) + ' ' + yScale(48*scale-4) + ', ' + xScale(250*scale) + ' ' +
        yScale(42*scale-4) + ', ' + xScale(250*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(250*scale) + ', ' +
        yScale(54*scale-4) + ' ' + xScale(260*scale) + ' ' + yScale(48*scale-4);
    buttons.append('polyline')
        .attr('points', leftTrianglePoints).attr("stroke","none").style('fill', 'black');
    buttons.append('polyline')
        .attr('points', rightTrianglePoints).attr("stroke","none").style('fill', 'black');

    var sec = experimentr.data()['section'];
    var clk = '';
    if(sec=='mat'){clk='clicks';}
    if(sec=='practice'){clk='practice_clicks';}
    if(sec=='practice2'){clk='practice2_clicks';}
    if(sec=='section2'){clk='s2_clicks';}
    for(var m=0;m<6;m++){
        var radioButton = buttons.append("g").attr("transform","translate("+x[m]*scale+","+y*scale+")");
        radioButton.append("svg:image").attr("xlink:href","/resources/0.png").attr("class","choice").attr("id",m)
            .attr("x",0).attr("y",-5).attr("width",18*scale).attr("height",25*scale);
        radioButton.on({"mouseover": function(d) {
            d3.select(this).style("cursor", "pointer")},
            "mouseout": function(d) {d3.select(this).style("cursor", "default")}})
            .on("click",function(d){
                buttons.select(".no").attr("opacity",0.2);
                buttons.selectAll(".choice").attr("xlink:href","/resources/0.png");
                d3.select(this).select("image").attr("xlink:href","/resources/1.png");
                var t = Date.now();
                experimentr.data()[clk].push([
                    t,
                    //svg.attr("id").slice(1),
                    d3.select(this.parentNode.parentNode).select("#c10").text(),
                    d3.select(this).select(".choice").attr("id")
                ]);
                // window.alert(d3.select(this).select(".choice").attr("id"));
                var choice = parseInt(d3.select(this).select(".choice").attr("id"));
                if(choice<3){
                    buttons.select("#selection_rect").remove();
                    buttons.append("rect")
                        .attr("x",13)
                        .attr("y",60)
                        .attr("width",75)
                        .attr("height",25)
                        .style("fill","none")
                        .style("stroke","#CC1100")
                        .style("stroke-width","3")
                        .attr("id","selection_rect");
                    buttons.select("#lbl_same").style("font-weight","normal");
                    buttons.select("#lbl_diff").style("font-weight","bold");

                } else {
                    buttons.select("#selection_rect").remove();
                    buttons.append("rect")
                        .attr("x",195)
                        .attr("y",60)
                        .attr("width",50)
                        .attr("height",25)
                        .style("fill","none")
                        .style("stroke","#33CE45")
                        .style("stroke-width","3")
                        .attr("id","selection_rect");
                    buttons.select("#lbl_same").style("font-weight","bold");
                    buttons.select("#lbl_diff").style("font-weight","normal");

                }
            });
    }
}

function parsing(route, dest){
    d3.text(route, function (csvdata) {
        var groups = {};
        var parsedCSV = d3.csv.parseRows(csvdata);
        for (var j = 1; j < parsedCSV.length; j++) {
            if (!(parsedCSV[j][0] in groups)) {
                groups[parsedCSV[j][0]] = [parsedCSV[j]];
            } else {
                groups[parsedCSV[j][0]] = groups[parsedCSV[j][0]].concat([parsedCSV[j]]);
            }
        }
        var values = Object.keys(groups).map(function (key) {
            return groups[key];
        });
        var raw_binary = values.filter(function (d) {
            return d.length == 2;
        });
        if(experimentr.data()['section']=='mat'){
            n_pair = raw_binary.length;
        }
        if(experimentr.data()['section']=='section2'){
            s2_n_pair = raw_binary.length;
        }
        var binary = [];
        var other = [];
        var tmp = [];
        //console.log(raw_binary.length);
        for (var i = 0; i < raw_binary.length; i++) {
            if (tmp.length == 6) {
                if(tmp.length<6){
                    tmp.push(raw_binary[i]);
                }
                binary.push(tmp);
                tmp = [raw_binary[i]];
            } else {
                tmp.push(raw_binary[i]);
            }
            //console.log(raw_binary[i]);
        }
        //console.log(tmp);
        if (tmp != []) {
            binary.push(tmp);
        }
        binary.push([]);
        tmp = values.filter(function (d) {
            return d.length == 4;
        });
        for (var i = 0; i < tmp.length; i++) {
            var t = [];
            for (var j = 0; j < tmp[i].length / 2; j++) {
                t.push([tmp[i][2 * j], tmp[i][2 * j + 1]]);
            }
            other.push(t);
        }
        tmp = values.filter(function (d) {
            return d.length == 6;
        });
        for (var i = 0; i < tmp.length; i++) {
            var t = [];
            for (var j = 0; j < tmp[i].length / 2; j++) {
                t.push([tmp[i][2 * j], tmp[i][2 * j + 1]]);
            }
            other.push(t);
        }
        data[dest] = binary.concat(other);
        // answer keys

        var answer = [];
        for(var i=0;i<raw_binary.length;i++){
            answer.push(raw_binary[i][0][raw_binary[i][0].length-1]);
        }
        data[dest+'_answer'] = answer;
        experimentr.addData(data);
    });
}


