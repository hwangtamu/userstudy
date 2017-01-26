/**
 * Created by hanwang on 1/23/17.
 */

let cwidth = [90,100,120,40,140,40,50,60,90,100]; //880
let height = 24; //height per row


// draw a cell
// x,y : position
// cx,cy : size
// t : text (string)
// c : color
// g : div in HTML
// j : id
function cell(x,y,cx,cy,t,g,j){
    let cell = g.append("g").attr("id","c"+j.toString()).attr("class","cell").attr("transform","translate("+x+","+y+")");
    let rectangle = cell.append("rect").attr("id",j);
    rectangle.attr("x",0).attr("y",0).attr("width",cx).attr("id","r"+j.toString())
        .attr("height",function(){if(j==10){return cy*2+3;}if(j==20){return 0;}return cy;})
        .style("fill",function(){if(j<10||j%10==0){return "#68a7ca";}return "#b2d3e6";})
        .style("opacity",1);
    let textbox = cell.append("text").attr("id",j).attr("id","t"+j.toString());
    textbox.attr("x",cx/2).attr("y",function(){if(j==10){return cy/2+18;}return cy/2+5;})
        .attr("text-anchor","middle").style("font","16px monaco").style("font-weight","bold")
        .text(function(){if(j==20){return "";}return t;});
}
// draw a row
function row(t,y,g,j){
    for(i=0;i<cwidth.length;i++){
        cell(5*i+cwidth.slice(0,i).reduce((a, b) => a + b, 0),y,cwidth[i],height,t[i],g,j*10+i);
    }
}

// draw a block
function pair(t,g){
    row(t.slice(0,cwidth.length),0,g,0);
    row(t.slice(cwidth.length,2*cwidth.length),30,g,1);
    row(t.slice(2*cwidth.length,3*cwidth.length),57,g,2);
}
// draw choice panel
// mode: 1=default 2=introduce
function choices(svg,lBound, scale,mode) {
    let options = ["Highly Likely Different",
        "Moderately Likely Different",
        "Less Likely Different",
        "Less Likely Same",
        "Moderately Likely Same",
        "Highly Likely Same"];
    let x = [20, 60, 100, 140, 180, 220];
    let lx = [10, 20, 38, 60, 78, 100, 118, 140, 158, 180, 198, 220, 238, 250];
    let y = 40;
    // add buttons
    let buttons = svg.append("g").attr("transform", "translate(" + lBound + ",0)");
    //buttons.append("rect").attr("x",-10*scale).attr("y",0).attr("width",280*scale).attr("height",85*scale).style("fill","#68a7ca").style("opacity",1);
    if(mode!=2){
        buttons.append("text").attr("x", 220 * scale).attr("y", 78 * scale).text("Same").attr("text-anchor", "middle").style("font", 24 * scale + "px sans-serif");
        buttons.append("text").attr("x", 50 * scale).attr("y", 78 * scale).text("Different").attr("text-anchor", "middle").style("font", 24 * scale + "px sans-serif");
    }
    for (p = 0; p < options.length; p++) {
        buttons.append("text").attr("id","labelText"+p.toString())
            .attr("x", (x[p] + 8) * scale).attr("y", function(){if(mode==2 && p%2==1){return 66*scale;}return 30 * scale;})
            .text(function(){if(mode==2){return options[p];}return options[p][0];})
            .attr("text-anchor", "middle").style("font", function(){if(mode==2){return 14+"px sans-serif";}return 24 * scale + "px sans-serif";});
    }
    //arrows
    for(pos=0;pos<7;pos++){
        let lineData = [{"x": lx[2*pos]*scale, "y": 44*scale+4*(scale-1)}, {"x": lx[2*pos+1]*scale, "y": 44*scale+4*(scale-1)}];
        let lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");
        buttons.append("path").attr("d", lineFunction(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .style("fill","none");
    }
    let xScale = d3.scale.linear();
    let yScale = d3.scale.linear();
    let leftTrianglePoints = xScale(0) + ' ' + yScale(48*scale-4) + ', ' + xScale(10*scale) + ' ' + yScale(42*scale-4) +
        ', ' + xScale(10*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(10*scale) + ', ' + yScale(54*scale-4) + ' ' +
        xScale(0) + ' ' + yScale(48*scale-4);
    let rightTrianglePoints = xScale(260*scale) + ' ' + yScale(48*scale-4) + ', ' + xScale(250*scale) + ' ' +
        yScale(42*scale-4) + ', ' + xScale(250*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(250*scale) + ', ' +
        yScale(54*scale-4) + ' ' + xScale(260*scale) + ' ' + yScale(48*scale-4);
    buttons.append('polyline')
        .attr('points', leftTrianglePoints)
        .attr("stroke","none")
        .style('fill', 'black');
    buttons.append('polyline')
        .attr('points', rightTrianglePoints)
        .attr("stroke","none")
        .style('fill', 'black');

    for(m=0;m<6;m++){
        let radioButton = buttons.append("g").attr("transform","translate("+x[m]*scale+","+y*scale+")");
        //radioButton.append("text").attr("x",25).attr("y",10).attr("text-anchor","left").style("font","14px sans-serif").text(options[m]);
        radioButton.append("svg:image").attr("xlink:href","/resources/0.png").attr("class","choice").attr("id",m)
            .attr("x",0).attr("y",-5).attr("width",18*scale).attr("height",18*scale);
        radioButton.on({"mouseover": function(d) {d3.select(this).style("cursor", "pointer")},
            "mouseout": function(d) {d3.select(this).style("cursor", "default")}})
            .on("click",function(d){
                buttons.select(".no").attr("opacity",0.2);
                buttons.selectAll(".choice").attr("xlink:href","/resources/0.png");
                d3.select(this).select("image").attr("xlink:href","/resources/1.png");
                //console.log(k,d3.select(this).select(".choice").attr("id"),Date.now());
                //dat.clicks.push([k, Date.now()]);
            });
    }
}
