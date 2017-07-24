/* global require:true, console:true, process:true, __dirname:true */
'use strict'
/**
 * Created by hanwang on 1/23/17.
 */

// Group ID,Reg No.,FF,First Name,Last Name,LF,DoB,Sex,Race,Reg No.,First Name,Last Name,DoB,Sex,Race,Record ID,type,Same
// 1,1597730921,33,VIRGINIA,FOX,211,11/07/1945, F, W,1597730921,********,***,11/07/****, *, *, 35,  1,  1
// 0,         1, 2,       3,  4,  5,         6, 7, 8,         9,      10, 11,        12,13,14, 15, 16,  1

var title = ["Pair","ID","FFreq","First name","Last name","LFreq","DoB(M/D/Y)","Sex","Race","ID."];
var cwidth = [60,150,60,150,150,150,125,60,60,80]; //870
var height = 24; //height per row 0 30 57
var ys = [0,30,77];
//index mapping from hidden data to visible data per row
var mapping = [0,9,2,10,11,5,12,13,14,1,3,4,6,7,8,15];
var data = {}; // experimentr data
var n_pair = 0;
var s2_n_pair = 0;
var swap_switch=0;

/**
 * draw a cell
 * x,y : position
 * cx,cy : size
 * t : text (string)
 * c : color
 * g : div in HTML
 * j : id
 * k : cell type
 * cell type = {
 *      0:group id hidden
 *      1:title
 *      2:group id visible
 *      3:default data cell
 *      4:merged cell unclickable
 *      5:merged cell hidden
 *      6:clickable data cell
 *      9:hidden data
 *      }
 */
function cell(t,g,j,k){
    // erase title columns
    var index_r = g.attr("id").slice(1)%6;
    var x = 40*(j%cwidth.length)+cwidth.slice(0,j%cwidth.length).reduce((a, b) => a + b, 0),
        y = index_r==0&&j>=cwidth.length ? ys[Math.floor(j/cwidth.length)]+20 : ys[Math.floor(j/cwidth.length)],
        cx = cwidth[j%cwidth.length],
        cy = height;
    var cel = g.append("g").attr("id","c"+j.toString()).attr("class","cell")
        .attr("transform","translate("+x+","+y+")");
    var raw_t = t;

    //console.log(title[j%cwidth.length],t);
    var rectangle = cel.append("rect").attr("id",j);
    //only show rect on clickable cells
    //if(k==6 && j<2*cwidth.length){
    //    rectangle.attr("x",-5).attr("y",-5).attr("width",cx).attr("id","r"+j.toString())
    //        .attr("height",80).style("fill","#C5E3BF").attr("rx",5).attr("ry",5);
    //}
    if(index_r==0 && j<cwidth.length){
        rectangle.attr("x",0).attr("y",0).attr("width",cx+40).attr("id","r"+j.toString())
            .attr("height",function(){if(k==2||k==4){return cy*2+23;}if(k==0||k==5||(index_r>0 && k==1)){return 0;}return cy;})
            .style("fill","none")
            .style("fill",function(){if(k==1||k==2){return "#add8e6";}if(k==3||k==4){return "#b2d3e6";}if(k==6){return "#C5E3BF"}})
            .style("opacity",1);
    }

    var textbox = cel.append("text").attr("class","tbox").attr("id","t"+j.toString());
    textbox.attr("x",function(){
        //if(k==3 && (title[j%10]=="FFreq"||title[j%10]=="LFreq"||
        //title[j%10]=="ID.")){return cx/2;}
        if(t=="ID"){return 18;}
        if(t=="Race"){return 20;}
        if(t=="Sex"){return 20;}
        if(title[j%cwidth.length]=="Sex" && experimentr.data()["mode"]=="Vanilla"){return "2em";}
        if(j>cwidth.length && title[j%cwidth.length]=="Race"){return "2em";}
        if(k==2){return cx/2;}
        return 0;})
    //if(t.length>0){return cx*(0.02+0.48/t.length)-4;}})
        .attr("y",function(){if(k==2){return cy/2+28;}if(k==1||k==3||k==4||k==5||k==6){return cy/2+5;}})
        .attr("text-anchor",function(){
            //if(k==3 && (title[j%10]=="FFreq"||title[j%10]=="LFreq"||j%10==0||
            //title[j%10]=="ID.")){return "middle";}
            if(k==2){return "middle";}
            // || title[j%cwidth.length]=="Race"
            return "left";})
        .style("font",function(){
            if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}
            if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}
            return "16px Lucida Console";})//.style("font-weight","bold")
        .text(function(){
            if(title[j%cwidth.length]=="ID."){return " ";}
            else if(k==0||(index_r>0 && k==1)){return " ";}
            else if(k==3 && (title[j%cwidth.length]=="FFreq"||title[j%cwidth.length]=="LFreq")){return "";}
            return t;
        }).style("fill", function(){if(j>=cwidth.length && j%cwidth.length<1){return "grey";}});
    if(k==1){
        textbox.style("font-weight","bold");
    }

    // icons
    var indel = [],
        replace = [],
        transpose = [],
        indel_ = [],
        replace_ = [],
        transpose_ = [],
        trailing = [],
        trailing_ = [],
        date_swap = 0,
        diff = 0,
        swap = 0;

    if(j>cwidth.length){
        //icons for frequency
        if(k==3 && (title[j%cwidth.length]=="FFreq"||title[j%cwidth.length]=="LFreq")) {
            var div = cel.append("g").style("opacity",0);
            var bg = div.append("rect").style("fill","none").attr("x",-2).attr("y",-14).attr("width",0).attr("height",20)
                .attr("stroke", "grey")
                .attr("stroke-width",1);
            var tip = div.append("text").style("fill","grey").attr("text-anchor", "left");

            if(t==1){
                cel.append("svg:image").attr("xlink:href","/resources/unique.png").attr("class","freq")
                    .attr("x",10).attr("y",cy/2-9).attr("width",20).attr("height",20);
                tip.text('Unique Name');
                bg.attr("width",90);
            } else {
                if(t<=5) {
                    // cel.append("svg:image").attr("xlink:href","/resources/rare.svg").attr("class","icon")
                    //     .attr("x",cwidth[j%cwidth.length]/3).attr("y",cy/2-9).attr("width",20).attr("height",20);
                    cel.append("svg:image").attr("xlink:href","/resources/rare_2_rect.svg").attr("class","freq")
                        .attr("x",10).attr("y",cy/2-9).attr("width",22).attr("height",22);
                    tip.text('Rare Name');
                    bg.attr("width",80);
                } else {
                    if(t<=100) {
                        cel.append("svg:image").attr("xlink:href", "/resources/3_dots.png").attr("class", "freq")
                            .attr("x", 10).attr("y", cy / 2 - 9).attr("width", 20).attr("height", 20);
                        tip.text('Occurred Often');
                        bg.attr("width",100);
                    } else {
                        cel.append("svg:image").attr("xlink:href", "/resources/infinity.png").attr("class", "freq")
                            .attr("x", 10).attr("y", cy / 2 - 9).attr("width", 20).attr("height", 20);
                        tip.text('Common Name');
                        bg.attr("width",100);
                    }
                }
            }
            cel.on("mouseover",function(d){
                div.style("opacity",1);
            });
            cel.on("mouseout",function(d){
                div.style("opacity",0);
            });
            if(experimentr.data()['mode']!='Vanilla'){
                experimentr.data()['freq']+=1;
            }
        }
        // check if it's a name swap
        if(experimentr.data()['mode']!='Vanilla' && title[j%cwidth.length]=="First name"||title[j%cwidth.length]=="Last name"){
            var m = j+cwidth.length,
                p = g.attr("id").slice(1),
                dat = experimentr.data()[experimentr.data()['section']][Math.floor(p/6)],
                fnj = "",
                fnm = "",
                lnj = "",
                lnm = "";
            //console.log(dat[p%6]);
            if(title[j%cwidth.length]=="First name"){
                fnj = dat[p%6][0][mapping[mapping[j%cwidth.length]]];
                fnm = dat[p%6][1][mapping[mapping[m%cwidth.length]]];
                lnj = dat[p%6][0][mapping[mapping[j%cwidth.length+1]]];
                lnm = dat[p%6][1][mapping[mapping[m%cwidth.length+1]]];
            }
            if(title[j%cwidth.length]=="Last name"){
                fnj = dat[p%6][0][mapping[mapping[j%cwidth.length-1]]];
                fnm = dat[p%6][1][mapping[mapping[m%cwidth.length-1]]];
                lnj = dat[p%6][0][mapping[mapping[j%cwidth.length]]];
                lnm = dat[p%6][1][mapping[mapping[m%cwidth.length]]];
            }

            if(fnj==lnm && fnm==lnj){
                swap = 1;
                if(j<2*cwidth.length && title[j%cwidth.length]=="First name"){
                    cel.append("svg:image").attr("xlink:href","/resources/name_swap.svg").attr("class","icon")
                        .attr("x",cwidth[j%cwidth.length]-45).attr("y",cy/2-8).attr("width",60).attr("height",60);
                }
                if(["Vanilla","Full"].indexOf(experimentr.data()["mode"])<0){
                    t = t.replace(/[A-Z0-9]/g, function(){if(j%14>9){return "&";}return "@";});
                }
                experimentr.data()['nswap']+=0.25;
            }
            //console.log(j, fnj, fnm, lnj, lnm);
        }
        if(textbox.text()==""){
            if(title[j%cwidth.length]!="FFreq" && title[j%cwidth.length]!="LFreq"){
                // missing
                cel.append("svg:image").attr("xlink:href","/resources/missing.png").attr("class","icon")
                    .attr("x",function(){
                        if(title[j%cwidth.length]=="ID"){return 36;}
                        else if(title[j%cwidth.length]!="DoB(M/D/Y)"){return cwidth[j%cwidth.length]/3;}
                        return 40;})
                    .attr("y",cy/2-9).attr("width",18).attr("height",18);
                experimentr.data()['missing']+=1;
            }
        }
        //else if(textbox.text()==" " && j<cwidth.length*2){
        //    // check mark
        //    cel.append("svg:image").attr("xlink:href","/resources/checkmark.png").attr("class","icon")
        //        .attr("x",function(){if(title[j%cwidth.length]!="DoB(M/D/Y)"){return cwidth[j%cwidth.length]/3;}return 40;})
        //        .attr("y",cy/2+15).attr("width",18).attr("height",18);
        else if(textbox.text()==" " && title[j%cwidth.length]!="ID." && title[j%cwidth.length]!="Pair"){
            // double check mark
            cel.append("svg:image").attr("xlink:href","/resources/checkmark.png").attr("class","icon")
                .attr("x",function(){if(title[j%cwidth.length]=="First name"||title[j%cwidth.length]=="Last name"){return 0;}
                else if(title[j%cwidth.length]=="ID"){return 35;}
                else if(title[j%cwidth.length]!="DoB(M/D/Y)"){return cwidth[j%cwidth.length]/3;}
                    return 40;})
                .attr("y",cy/2-5).attr("width",18).attr("height",18);
            experimentr.data()['checks']+=0.5;
        }else {
            var num = 0;
            if (swap == 0 && title[j % cwidth.length] != "ID." && title[j % cwidth.length] != "FFreq" && title[j % cwidth.length] != "LFreq") {
                var m = j + cwidth.length,
                    p = g.attr("id").slice(1),
                    dat = experimentr.data()[experimentr.data()['section']][Math.floor(p / 6)],
                    t_j = dat[p % 6][0][mapping[j % cwidth.length]],
                    t_m = dat[p % 6][1][mapping[m % cwidth.length]],
                    bin = [];

                if(experimentr.data()["mode"]=="Full" && title[j % cwidth.length] == "Sex"){

                    if(t_j != t_m){
                        if (j < 2 * cwidth.length) {
                            g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/diff.svg")
                                .attr("class", "icon")
                                .attr("x", 17)
                                .attr("y", cy / 2 + 5).attr("width", 35).attr("height", 35);
                        }
                    }
                } else {
                    if (title[j % cwidth.length] != "Pair" && t_j.indexOf("*") == -1 && t_m.indexOf("*") == -1 && t_j.trim() != "" && t_m.trim() != "") {
                        //var len = (t_j.length<=t_m.length?t_j.length:t_m.length)/2;
                        //console.log(t_j, t_m);
                        diff = 1;
                        if (j < 2 * cwidth.length) {
                            g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/diff.svg")
                                .attr("class", "icon")
                                .attr("x", function () {
                                    if (title[j % cwidth.length] == "First name" || title[j % cwidth.length] == "Last name") {
                                        return 0;
                                    }
                                    else if (title[j % cwidth.length] == "DoB(M/D/Y)") {
                                        return 25;
                                    }
                                    else if (title[j % cwidth.length] == "ID") {
                                        return 28;
                                    } else if (title[j % cwidth.length] == "Sex") {
                                        return 17;
                                    }
                                    return 20;
                                })
                                .attr("y", cy / 2 + 5).attr("width", 35).attr("height", 35);
                            experimentr.data()['diff']+=1;
                        }
                    } else {
                        if (t_j != "" && t_m != "") {
                            for (var i = 0; i < Math.max(t_j.length, t_m.length); i++) {
                                // date swap
                                if (i == 0 && bin.indexOf(i) == -1 && t_j[i] == t_m[i + 3] && t_j[i + 1] == t_m[i + 4] && t_j[i + 3] == t_m[i] &&
                                    t_j[i + 4] == t_m[i + 1] && t_j[i] != "*" && t_j[i + 1] != "*" && t_j[i + 2] != "*" && t_j[i + 3] != "*") {
                                    //console.log(t_m, t_j);
                                    bin.push(i, i + 1, i + 2, i + 3, i + 4);
                                    if (j < 2 * cwidth.length) {
                                        g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/swap_date.svg")
                                            .attr("class", "icon").attr("x", 9 * i + 12)
                                            .attr("y", cy / 2 + 13).attr("width", 23).attr("height", 23);
                                    }
                                    experimentr.data()['dswap']+=0.5;
                                    date_swap = 1;
                                    num += 1
                                }
                                //indel
                                else if ((t_j[i] == "_" && t_m[i] != "_") || (t_j[i] != "_" && t_m[i] == "_")) {
                                    bin.push(i);
                                    if ((t_j[i] == "_" && t_m[i] != "_") || i > t_j.length) {
                                        indel_.push(i);
                                    }
                                    if ((t_j[i] != "_" && t_m[i] == "_") || i > t_m.length) {
                                        indel.push(i);
                                    }
                                    experimentr.data()['indel']+=1;
                                    //g.select("#c"+j.toString()).append("svg:image").attr("xlink:href","/resources/indel.png")
                                    //    .attr("class","icon").attr("x",9*i)
                                    //    .attr("y",cy/2+15).attr("width",16).attr("height",16);
                                }
                                //transpose
                                else if (bin.indexOf(i) == -1 && t_j[i] == t_m[i + 1] && t_j[i + 1] == t_m[i] && t_j[i] != "*" && t_m[i] != "*"
                                    && t_j[i + 1] != "*" && t_m[i + 1] != "*" && t_j[i] == t_m[i + 1] && t_j[i] != t_j[i + 1]) {
                                    //console.log(t_m, t_j);
                                    bin.push(i, i + 1);
                                    if (j < 2 * cwidth.length) {
                                        g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/transpose.png")
                                            .attr("class", "icon").attr("x", 9 * i + 4)
                                            .attr("y", cy / 2 + 13).attr("width", 18).attr("height", 18);
                                    }
                                    experimentr.data()['transpose']+=1;
                                    transpose.push(i, i + 1);
                                    transpose_.push(i, i + 1);
                                    num += 1;
                                }

                                //replace
                                else if (bin.indexOf(i) == -1 && t_j[i] != t_m[i] && t_j[i] != " " && t_m[i] != " ") {
                                    if (title[j % cwidth.length] != "ID" || (title[j % cwidth.length] == "ID" &&
                                        (j < 10 || Math.max(t_j.length, t_m.length) <= 10))) {
                                        bin.push(i);
                                        replace.push(i);
                                        replace_.push(i);
                                        experimentr.data()['replace']+=1;
                                    } else {
                                        if (t_m[i] == "?" || t_j[i] == "?") {
                                            bin.push(i);
                                            trailing.push(i);
                                            trailing_.push(i);
                                        }
                                    }
                                }
                            }
                        }

                        // reduce duplicate icons
                        var _indel = [],
                            _replace = [],
                            __indel = [],
                            __replace = [];

                        for (var i = 0; i < indel.length; i++) {
                            //console.log(indel.indexOf(indel[i]-1));
                            if (indel.indexOf(indel[i] - 1) == -1) {
                                _indel.push([indel[i]]);
                            } else {
                                _indel[_indel.length - 1].push(indel[i]);
                            }
                        }

                        for (var i = 0; i < indel_.length; i++) {
                            //console.log(indel.indexOf(indel[i]-1));
                            if (indel_.indexOf(indel_[i] - 1) == -1) {
                                _indel.push([indel_[i]]);
                            } else {
                                _indel[_indel.length - 1].push(indel_[i]);
                            }
                        }

                        for (var i = 0; i < _indel.length; i++) {
                            __indel.push(_indel[i].reduce((previous, current) => current += previous) / _indel[i].length);
                        }

                        for (var i = 0; i < replace.length; i++) {
                            //console.log(replace.indexOf(replace[i]-1));
                            if (replace.indexOf(replace[i] - 1) == -1) {
                                _replace.push([replace[i]]);
                            } else {
                                _replace[_replace.length - 1].push(replace[i]);
                            }
                        }

                        for (var i = 0; i < _replace.length; i++) {
                            __replace.push(_replace[i].reduce((previous, current) => current += previous) / _replace[i].length);
                        }
                        if (j < 2 * cwidth.length) {
                            for (var i = 0; i < __indel.length; i++) {
                                g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/indel.png")
                                    .attr("class", "icon").attr("x", 9 * __indel[i] + "px")
                                    .attr("y", cy / 2 + 16).attr("width", 13).attr("height", 13);
                                num += 1;
                            }

                            for (var i = 0; i < __replace.length; i++) {
                                g.select("#c" + j.toString()).append("svg:image").attr("xlink:href", "/resources/replace.png")
                                    .attr("class", "icon").attr("x", 9 * __replace[i] + "px")
                                    .attr("y", cy / 2 + 16).attr("width", 13).attr("height", 13);
                                num += 1;
                            }
                        }
                        //if(bin.length>0){
                        //    console.log(indel, replace);
                        //}
                        //console.log(num);
                    }
                }
            }
        }
    }

    //date swap with special charecters
    if(date_swap==1 && experimentr.data()['mode']=="Partial"){
        if(j<2*cwidth.length){
            t = t.slice(0,3)+'&&'+t.slice(5);
        }else{
            t = t.slice(0,3)+'@@'+t.slice(5);
        }
        //console.log(t);
    }

    if(j<2*cwidth.length && textbox.text()=="  "){
        g.select("#c"+j.toString()).selectAll(".icon").remove();
        //    cel.append("svg:image").attr("xlink:href","/resources/replace.png").attr("class","icon")
        //        .attr("x",cwidth[j%cwidth.length]/5).attr("y",cy/2).attr("width",48).attr("height",48);
    }

    // click event
    // if(k==6){
    //
    //     rectangle.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
    //     textbox.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
    //     rectangle.on("mouseout",function(){d3.select(this).style("cursor", "default");});
    //     textbox.on("mouseout",function(){d3.select(this).style("cursor", "default");});
    //
    //     var m = j>=2*cwidth.length ? j-cwidth.length : j+cwidth.length;
    //
    //     rectangle.on("click",function(){
    //         var p = this.parentNode.parentNode.id.slice(1); //pair id
    //         var dat = experimentr.data()['mat'][Math.floor(p/5)];
    //         if(experimentr.data()['mode']=="Partial_Cell"){
    //             var t_j = j<2*cwidth.length ? dat[p%5][0][j%cwidth.length] : dat[p%5][1][j%cwidth.length];
    //             var t_m = m<2*cwidth.length ? dat[p%5][0][m%cwidth.length] : dat[p%5][1][m%cwidth.length];
    //             d3.select(this.parentNode).remove();
    //             d3.select(this.parentNode.parentNode).select("#c"+j.toString()).remove();
    //             cell(t_j,g,j,3);
    //             cell(t_m,g,m,3);
    //         }
    //         if(experimentr.data()['mode']=="Partial_Row"){
    //             d3.select(this.parentNode.parentNode).selectAll(".cell").remove();
    //             pair(title.concat(dat[p%5][0]).concat(dat[p%5][1]),g,"Full_Partial");
    //         }
    //     });
    //     textbox.on("click",function(){
    //         var p = this.parentNode.parentNode.id.slice(1); //pair id
    //         var dat = experimentr.data()['mat'][Math.floor(p/5)];
    //         if(experimentr.data()['mode']=="Partial_Cell"){
    //             var t_j = j<2*cwidth.length ? dat[p%5][0][j%cwidth.length] : dat[p%5][1][j%cwidth.length];
    //             var t_m = m<2*cwidth.length ? dat[p%5][0][m%cwidth.length] : dat[p%5][1][m%cwidth.length];
    //             d3.select(this.parentNode).remove();
    //             d3.select(this.parentNode.parentNode).select("#c"+j.toString()).remove();
    //             cell(t_j,g,j,3);
    //             cell(t_m,g,m,3);
    //         }
    //         if(experimentr.data()['mode']=="Partial_Row"){
    //             d3.select(this.parentNode.parentNode).selectAll(".cell").remove();
    //             pair(title.concat(dat[p%5][0]).concat(dat[p%5][1]),g,"Full_Partial");
    //         }
    //
    //     });
    // }

    // coloring letters based on operations
    // indel, indel_, replace, replace_, transpose, transpose_
    // coloring '@' and '#'
    if(diff==1){
        indel=[];
        indel_=[];
        replace=[];
        replace_=[];
        transpose = [];
        transpose_ = [];

        // replace display content to special symbols '@', '&'
        if(["Full","Vanilla","Opti1"].indexOf(experimentr.data()['mode'])<0 && title[j%cwidth.length]=="Race"){
            if(j>2*cwidth.length){t = '&';}
            else if(j>cwidth.length){t = '@';}
        }
        if(["Vanilla","Full", "Opti2"].indexOf(experimentr.data()['mode'])<0 && title[j%cwidth.length]=="ID"){
            if(j>2*cwidth.length){t = t.replace(/[A-Z0-9]/g, '&');}
            else if(j>cwidth.length){t = t.replace(/[A-Z0-9]/g, '@');}
        }
        if(["Vanilla","Full", "Opti1", "Opti2"].indexOf(experimentr.data()['mode'])<0 &&
            ["First name", "Last name", "DoB(M/D/Y)","Race"].indexOf(title[j%cwidth.length])>-1){
            if(j>2*cwidth.length){t = t.replace(/[A-Z0-9]/g, '&');}
            else if(j>cwidth.length){t = t.replace(/[A-Z0-9]/g, '@');}
        }
    }
    // if(diff==0 && ["First name", "Last name", "DoB(M/D/Y)"].indexOf(title[j%cwidth.length])>-1 && experimentr.data()['mode']=="Opti1"){
    //     var p = g.attr("id").slice(1),
    //         dat = experimentr.data()['mat'][Math.floor(p/6)];
    //     if(textbox.text().indexOf("*")>-1){
    //         if(title[j%cwidth.length]=="First name"){
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length-1] : dat[p%6][1][j%cwidth.length-1];
    //         }else if(title[j%cwidth.length]=="Last name"){
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length] : dat[p%6][1][j%cwidth.length];
    //         }else{
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length+1] : dat[p%6][1][j%cwidth.length+1];
    //         }
    //     }
    // }
    // if(diff==0 && ["First name", "Last name", "DoB(M/D/Y)"].indexOf(title[j%cwidth.length])>-1 && experimentr.data()['mode']=="Opti1"){
    //     var p = g.attr("id").slice(1),
    //         dat = experimentr.data()['mat'][Math.floor(p/6)];
    //     if(textbox.text().indexOf("*")>-1){
    //         if(title[j%cwidth.length]=="First name"){
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length-1] : dat[p%6][1][j%cwidth.length-1];
    //         }else if(title[j%cwidth.length]=="Last name"){
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length] : dat[p%6][1][j%cwidth.length];
    //         }else{
    //             t = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length+1] : dat[p%6][1][j%cwidth.length+1];
    //         }
    //     }
    // }
    // if(j>cwidth.length && diff==0 && experimentr.data()['mode']=='Opti1' &&
    //     ['First name', 'Last name', 'DoB(M/D/Y)'].indexOf(title[j%cwidth.length])>-1){
    //     console.log(t);
    // }
    if((experimentr.data()['mode']!="Vanilla") && k>=3 && k<=6 &&
        title[j%cwidth.length]!="ID." && title[j%cwidth.length]!="LFreq" && title[j%cwidth.length]!="FFreq"){
        g.select("#c"+j.toString()).select(".span").remove();
        var p = g.attr("id").slice(1), //pair id
            dat = experimentr.data()[experimentr.data()['section']][Math.floor(p/6)],
            m = j>=2*cwidth.length ? j-cwidth.length : j+cwidth.length,
            //len = textbox.text().length,
            len = t.length,
            $cel = g.select("#c"+j.toString()),
            $tb = $cel.append("text").attr("class","span"),
            t_j = j<2*cwidth.length ? dat[p%6][0][mapping[j%cwidth.length]] : dat[p%6][1][mapping[j%cwidth.length]],
            t_m = m<2*cwidth.length ? dat[p%6][0][mapping[m%cwidth.length]] : dat[p%6][1][mapping[m%cwidth.length]],
            t_jj = j<2*cwidth.length ? dat[p%6][0][j%cwidth.length] : dat[p%6][1][j%cwidth.length],
            scheme = [];
        for(var l=0;l<len;l++){
            if(t_j[l]==t_m[l] && t_j[l]!='T' && t_j[l]!='X'){scheme.push(0);}
            else{scheme.push(1);}
        }
        if(j>cwidth.length && diff==0 && experimentr.data()['mode']=='Opti1' &&
            ['First name', 'Last name', 'DoB(M/D/Y)'].indexOf(title[j%cwidth.length])>-1){
            if(t.indexOf('*')>-1 && t_m!="" && t_j!=""){
                t = t_jj;
                //console.log(t_m, t_j);
            }
            //console.log(t, t_jj);
        }

        if(experimentr.data()['mode']=='Partial'){
            if(j>2*cwidth.length){t = t.replace(/[A-Z0-9]/g, '&');}
            else if(j>cwidth.length){t = t.replace(/[A-Z0-9]/g, '@');}
        }

        var t_count = 0;
        for(var l=0;l<len;l++){
            if(t[l]!="_"){
                var $tspan = $tb.append('tspan').attr("class","char");
                $tspan.attr("x",function(){
                    if(title[j%cwidth.length]=="Race" ){return "2em";}
                    if(title[j%cwidth.length]=="Sex" ){return "1.75em";}
                    return 9*t_count+"px";
                }).attr("y",cy/2+5)
                    .style("font",function(){
                        if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}
                        if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}
                        return "16px Lucida Console";})
                    .style("font-weight",function(){if(diff==0 &&
                        (((j<2*cwidth.length && indel.indexOf(l)>-1)||(j>2*cwidth.length && indel_.indexOf(l)>-1))||
                        (j<2*cwidth.length && replace.indexOf(l)>-1)||(j>2*cwidth.length && replace_.indexOf(l)>-1)||
                        (j<2*cwidth.length && transpose.indexOf(l)>-1)||(j>2*cwidth.length && transpose_.indexOf(l)>-1)||
                        (j<2*cwidth.length && trailing.indexOf(l)>-1)||(j>2*cwidth.length && trailing_.indexOf(l)>-1))){return "bold";}})
                    .attr("fill",function(){
                        if((j<2*cwidth.length && indel.indexOf(l)>-1)||(j>2*cwidth.length && indel_.indexOf(l)>-1)||
                            (j<2*cwidth.length && trailing.indexOf(l)>-1)||(j>2*cwidth.length && trailing_.indexOf(l)>-1)){return "#33ce45";}
                        else if((j<2*cwidth.length && replace.indexOf(l)>-1)||(j>2*cwidth.length && replace_.indexOf(l)>-1)){return "#9b3d18";}
                        else if((j<2*cwidth.length && transpose.indexOf(l)>-1)||(j>2*cwidth.length && transpose_.indexOf(l)>-1)){return "#009fff";}
                        return "black";})
                    .text(function(){if(t[l]=="?"){return "";}return t[l];});
                t_count+=1;
            }
        }
        g.select("#t"+j.toString()).remove();

    }

    // coloring text
    /*
     if(experimentr.data()['mode']!="Full"
     &&(k==6||k==3)&&title[j%cwidth.length]!="ID." && title[j%cwidth.length]!="LFreq" && title[j%cwidth.length]!="FFreq"){
     textbox.attr("opacity",0);
     g.select("#c"+j.toString()).select(".span").remove();
     var p = g.attr("id").slice(1), //pair id
     dat = experimentr.data()['mat'][Math.floor(p/5)],
     m = j>=2*cwidth.length ? j-cwidth.length : j+cwidth.length,
     len = textbox.text().length,
     $cel = g.select("#c"+j.toString()),
     $tb = $cel.append("text").attr("class","span"),
     t_j = j<2*cwidth.length ? dat[p%5][0][mapping[j%cwidth.length]] : dat[p%5][1][mapping[j%cwidth.length]],
     t_m = m<2*cwidth.length ? dat[p%5][0][mapping[m%cwidth.length]] : dat[p%5][1][mapping[m%cwidth.length]],
     t_jj = j<2*cwidth.length ? dat[p%5][0][j%cwidth.length] : dat[p%5][1][j%cwidth.length],
     scheme = [];
     for(f=0;f<len;f++){
     if(t_j[f]==t_m[f]){scheme.push(0);}
     else{scheme.push(1);}
     }
     for(l=0;l<len;l++){
     var $tspan = $tb.append('tspan');
     $tspan.attr("x",0.6*l+"em").attr("y",cy/2+5)
     .attr("text-anchor","left")
     .style("font",function(){if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}
     if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}return "16px Lucida Console";})
     .attr("fill",function(){
     if(t_j.length!=t_jj.length){return "black";}
     if(k==3 && scheme[l]==1 && textbox.text()[l]!="*" && textbox.text()[l]!="/"){return"black";}return "black";})
     .text(t[l]);

     $tspan.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
     $tspan.on("mouseout",function(){d3.select(this).style("cursor", "default");});

     //click function not implemented yet.
     }
     }*/

    //statictics
    if(['mat'].indexOf(experimentr.data()['section'])>-1 && j>cwidth.length &&
        ['ID', 'Last name', 'First name', 'DoB(M/D/Y)', 'Sex', 'Race'].indexOf(title[j%cwidth.length])>-1){
        if(experimentr.data()['mode']=='Vanilla'||experimentr.data()['mode']=='Full'){
            experimentr.data()['open_cell']+=1;
            //console.log(title[j%cwidth.length], t);
            if(t.match(/[A-Z0-9]/g)){
                experimentr.data()['char_display']+=t.match(/[A-Z0-9]/g).length;
                experimentr.data()['char_display']+=t.match("-") ? t.match("-").length:0;
                experimentr.data()['char_display']+=t.match("'") ? t.match("'").length:0;
                experimentr.data()['char_display']+=t.match(" ") ? t.match(" ").length:0;
            }
        }else{
            if(cel.selectAll('.char')[0].length==1){
                if([' ', '@', '&', '*'].indexOf(cel.select('.char').text())>-1){
                    experimentr.data()['close_cell']+=1;
                    if(['@', '&', '*'].indexOf(cel.select('.char').text())>-1){
                        experimentr.data()['symbol_display']+=1;
                    }
                }else{
                    experimentr.data()['open_cell']+=1;
                    experimentr.data()['char_display']+=1;
                }
            }else{
                //console.log(t.match(/[A-Z0-9]/g), t, raw_t);
                if(t.match(/[A-Z0-9]/g)){
                    if(t.indexOf('*')>-1){
                        experimentr.data()['partial_cell']+=1;
                    }else{
                        experimentr.data()['open_cell']+=1;
                    }
                    experimentr.data()['char_display']+=t.match(/[A-Z0-9]/g).length;
                    experimentr.data()['symbol_display']+=t.length-t.match(/[A-Z0-9]/g).length;
                }else{
                    experimentr.data()['close_cell']+=1;
                    experimentr.data()['symbol_display']+=t.length;
                }
                if(title[j%cwidth.length]=='DoB(M/D/Y)'){
                    experimentr.data()['symbol_display']-=2;
                }
            }
            //console.log(title[j%cwidth.length], t, cel.selectAll('.char').length);
        }
        console.log(experimentr.data()['open_cell'],experimentr.data()['partial_cell'],experimentr.data()['close_cell'],
            experimentr.data()['char_display'],experimentr.data()['symbol_display'],experimentr.data()['no_display'],);
    }

    if(['section2'].indexOf(experimentr.data()['section'])>-1 && j>cwidth.length &&
        ['ID', 'Last name', 'First name', 'DoB(M/D/Y)', 'Sex', 'Race'].indexOf(title[j%cwidth.length])>-1){
        if(experimentr.data()['mode']=='Vanilla'||experimentr.data()['mode']=='Full'){
            experimentr.data()['s2_open_cell']+=1;
            //console.log(title[j%cwidth.length], t);
            if(t.match(/[A-Z0-9]/g)){
                experimentr.data()['s2_char_display']+=t.match(/[A-Z0-9]/g).length;
            }
        }else{
            if(cel.selectAll('.char')[0].length==1){
                if([' ', '@', '&', '*'].indexOf(cel.select('.char').text())>-1){
                    experimentr.data()['s2_close_cell']+=1;
                }else{
                    experimentr.data()['s2_open_cell']+=1;
                }
            }else{
                if(t.match(/[A-Z0-9]/g)){
                    if(t.indexOf('*')>-1){
                        experimentr.data()['s2_partial_cell']+=1;
                    }else{
                        experimentr.data()['s2_open_cell']+=1;
                    }
                    experimentr.data()['s2_char_display']+=t.match(/[A-Z0-9]/g).length;
                    experimentr.data()['s2_symbol_display']+=t.length-t.match(/[A-Z0-9]/g).length;
                }else{
                    experimentr.data()['s2_close_cell']+=1;
                    experimentr.data()['s2_symbol_display']+=t.length;
                }
            }
            //console.log(title[j%cwidth.length], t, cel.selectAll('.char').length);
        }
        console.log(experimentr.data()['s2_open_cell'],experimentr.data()['s2_partial_cell'],experimentr.data()['s2_close_cell'],
            experimentr.data()['s2_char_display'],experimentr.data()['s2_symbol_display'],experimentr.data()['s2_no_display'],);
    }
}


/**
 * draw a row
 * @param t : text list
 * @param g : svg
 * @param j : row number 0/1/2
 * @param k : cell type list
 */
function row(t,g,j,k){
    var l = 0;
    for(var i=0;i<cwidth.length;i++){
        if(k[i]!=9){
            // console.log("The t is ",t[mapping[i]]);
            if(title[i%cwidth.length]=="Sex" && k[i]!=1){
                if(experimentr.data()["mode"]=="Partial") {
                    cell(t[i],g,j*cwidth.length+l,k[i],t[mapping[i]]);
                } else {
                    cell(t[mapping[i]],g,j*cwidth.length+l,k[i],t[i]);
                }
            } else {
                cell(t[i],g,j*cwidth.length+l,k[i],t[mapping[i]]);
            }
            l+=1;
        }
    }
}


/**
 * draw a pair
 * @param t:text
 * @param g:svg
 * @param m:mode
 */
function pair(t,g,m){
    var a = cwidth.length,
        b = cwidth.length+mapping.length,
        c = cwidth.length+2*mapping.length;
    var k = new Array(c).fill(1);

    k[a] = 2;
    k[b] = 0;
    var row1 = t.slice(a,b),
        row2 = t.slice(b,c),
        k1 = k.slice(a,b),
        k2 = k.slice(b,c);

    if(m=="Vanilla" || m=="Full"){
        mapping = [0,9,2,10,11,5,12,7,14,1,3,4,6,7,8,15];
    } else{
        mapping = [0,9,2,10,11,5,12,13,14,1,3,4,6,7,8,15];
    }

    if(m=="Partial"){
        for(var j=1;j<mapping.length;j++){
            k[a+j] = j<a ? 3:9; k[b+j] = j<a ? 3:9;
        }
        row1 = t.slice(a,b);row2 = t.slice(b,c);
        k1 = k.slice(a,b);k2 = k.slice(b,c);


        for(var j=0;j<mapping.length;j++){
            row1[j] = t[a+mapping[j]];row2[j] = t[b+mapping[j]];
        }
        //console.log(row1, row2);

        for(var j = 0;j<a;j++){

            if(title[j] != "FFreq" && title[j] != "LFreq" && title[j] != "Pair" && title[j] != "ID."){
                if(row1[j] == row2[j] && row1[j]!=""){
                    experimentr.data()["no_display"]+=row1[j].length+row2[j].length;
                    //console.log(row1[j],row2[j]);
                    row1[j] = " ";
                    row2[j] = " ";
                } else {
                    //row1[j] = row1[j].replace(/[A-Z0-9]/g, '@');
                    //row2[j] = row2[j].replace(/[A-Z0-9]/g, '&');
                }
            }
        }
    }
    else if(m=="Vanilla"){
        for(var j=1;j<mapping.length;j++){
            k[a+j] = j<a ? 3:9; k[b+j] = j<a ? 3:9;
        }
        k1 = k.slice(a,b);k2 = k.slice(b,c);
        for(var j=2;j<a;j++){
            if(title[j] == "FFreq" || title[j] == "LFreq"){
                t[j] = " "; row1[j] = " "; row2[j] = " ";
            }
        }
        //console.log(row1, row2);
    }
    else if(m=="Full"){
        for(var j=1;j<mapping.length;j++){
            k[a+j] = j<a ? 3:9;k[b+j] = j<a ? 3:9;
            if(j<cwidth.length){
                if(["First name", "Last name", "ID"].indexOf(title[j%cwidth.length])>-1){
                    //console.log(t[a+j].length, t[a+mapping[j]].length, t[b+j].length, t[b+mapping[j]].length);
                    if(row1[j].length!=row1[mapping[j]].length){
                        for(var i=0;i<row1[mapping[j]].length;i++){
                            if(row1[mapping[j]][i]=="_"){
                                row1[j] = row1[j].slice(0,i)+"_"+row1[j].slice(i)
                            }
                        }
                        //console.log(row1[j], row1[mapping[j]]);
                    }
                    if(row2[j].length!=row2[mapping[j]].length){
                        for(var i=0;i<row2[mapping[j]].length;i++){
                            if(row2[mapping[j]][i]=="_"){
                                row2[j] = row2[j].slice(0,i)+"_"+row2[j].slice(i)
                            }
                        }
                        //console.log(row2[j], row2[mapping[j]]);
                    }

                }
            }
        }
        k1 = k.slice(a,b);k2 = k.slice(b,c);
    }else{
        // var mapping = [0,1,3,8,9,5,10,11,2,4,6,7];
        for(var j=0;j<mapping.length;j++){
            row1[j] = t[a+mapping[j]];row2[j] = t[b+mapping[j]];
        }
        //console.log(row1, row2);
        k1[0] = 2;k2[0] = 0;
        if(m=="Hidden"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && title[j] != "FFreq" && title[j] != "LFreq" && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;
                }
            }
        }

        if(m=="Opti2"||m=="Opti1"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && title[j] != "FFreq" && title[j] != "LFreq" && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;
                }
            }

            for(var j = 0;j<a;j++){
                if(title[j] != "FFreq" && title[j] != "LFreq" && title[j] != "Pair" && title[j] != "ID."){
                    if(row1[j] == row2[j] && row1[j]!=""){
                        experimentr.data()["no_display"]+=row1[j].length+row2[j].length;
                        //console.log(row1[j],row2[j]);
                        row1[j] = " ";
                        row2[j] = " ";
                    }else if(row1[j]==""){
                        row2[j] = row2[j].replace(/[A-Z0-9]/g, "*");
                    }else if(row2[j]==""){
                        row1[j] = row1[j].replace(/[A-Z0-9]/g, "*");
                    }
                }
            }
            //console.log(row1, row2);
        }
        if(m=="Partial_Row"||m=="Partial_Cell"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && title[j] != "FFreq" && title[j] != "LFreq" && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;
                }
                if(j>1 && j<a && title[j] != "FFreq" && title[j] != "LFreq" && row1[j]!=row2[j] && row1[j]!="" && row2[j]!=""){
                    k1[j] = 6;k2[j] = 6;
                }
            }

            //for check mark
            for(var j = 0;j<a;j++){
                if(title[j] != "FFreq" && title[j] != "LFreq" && title[j] != "Pair" && title[j] != "ID."){
                    if(row1[j] == row2[j] && row1[j]!=""){
                        experimentr.data()["no_display"]+=row1[j].length+row2[j].length;
                        row1[j] = " ";
                        row2[j] = " ";
                    }else if(row1[j]==""){
                        row2[j] = row2[j].replace(/[A-Z0-9]/g, "*");
                    }else if(row2[j]==""){
                        row1[j] = row1[j].replace(/[A-Z0-9]/g, "*");
                    }
                }
            }
        }
    }
    var id = g.attr("id").slice(1)%6;
    if(id%2==1){
        var bg = g.append("rect").attr("id",j).attr("height", 120).attr("width", 1800).attr("y", 10).style("fill", "#eaf2ff");
    }
    if(id==0){
        row(t.slice(0,a),g,0,k.slice(0,a));
    }
    row(row1,g,1,k1);
    row(row2,g,2,k2);
}


/**
 * draw multiple pairs
 * @param t : data
 * @param s : step
 * @param n : number of pairs
 * @param m : mode
 */
function pairs(t,s,n,m) {
    // console.log(t);
    var num = n;
    var len = 0;
    for(var i=0;i<n;i++){
        var pr = t[i];
        var ls_1 = pr[0][9].length;
        var ls_2 = pr[1][9].length;
        var cur_len = ls_1 >= ls_2 ? ls_1:ls_2;
        len = len >= cur_len ? len:cur_len;
    }
    //console.log(t);
    //var cwidth = [60,80,60,160,200,60,140,150]; //910
    //var lwidth = len* 13;
    // var lwidth = 100 + (len-5) * 5;
    // var extra_width = (200-lwidth)/2;
    // //console.log(len,lwidth);
    // cwidth = [60,200,60,180,lwidth,150,60+extra_width,100,20]; //910
    for(var i=0;i<n;i++){
        var g = d3.select("#table").append("svg").attr("class","blocks").attr("id","g"+(s*6+i).toString())
            .attr("width", 1800).attr("height", function(){if(i==0){return 140;}return 120;});
        t[i][0] = t[i][0].slice(0,t[i][0].length-2);
        t[i][1] = t[i][1].slice(0,t[i][1].length-2);
        pair(title.concat(t[i][0]).concat(t[i][1]),g,m);
        if(i==0){
            choices(g,1450,1,1,40);
            // var panel = g.append("g").attr("id","panel").attr("transform","translate(920,0)");
            var panel = g.append("g").attr("id","panel").attr("transform","translate(1350,0)");

            // var re = panel.append("rect").attr("x",30).attr("height",24).attr("width",320).style("fill","add8e6");
            var re = panel.append("rect").attr("x",-20).attr("height",24).attr("width",570).style("fill","add8e6");

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

// draw choice panel
// mode: 1=default 2=introduce
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


// draw choice panel
// mode: 1=default 2=introduce
function alt_choices(svg,lBound,mode) {
    var options = ["Highly Likely Different",
        "Moderately Likely Different",
        "Less Likely Different",
        "Less Likely Same",
        "Moderately Likely Same",
        "Highly Likely Same"];
    var x = [60, 180, 300, 420, 540, 660];
    var lx = [30, 60, 96, 180, 216, 300, 336, 420, 456, 540, 576, 660, 696, 750];
    var y = 140;
    // add buttons
    var buttons = svg.append("g").attr("transform", "translate(" + lBound + ",0)");
    //buttons.append("rect").attr("x",-10*scale).attr("y",0).attr("width",280*scale).attr("height",85*scale).style("fill","#68a7ca").style("opacity",1);
    if(mode!=2){
        buttons.append("text").attr("x", 660).attr("y", 220).text("Same").attr("text-anchor", "middle").style("font", 36 + "px sans-serif");
        buttons.append("text").attr("x", 150).attr("y", 220).text("Different").attr("text-anchor", "middle").style("font", 36 + "px sans-serif");
    }
    for (var p = 0; p < options.length; p++) {
        buttons.append("text").attr("id","labelText"+p.toString())
            .attr("x", x[p] + 18).attr("y", function(){if(mode==2 && p%2==1){return 180;}return 110;})
            .text(function(){if(mode==2){return options[p];}return options[p][0];})
            .attr("text-anchor", "middle").style("font", function(){if(mode==2){return 14+"px sans-serif";}return 40 + "px sans-serif";});
    }
    //arrows
    for(var pos=0;pos<7;pos++){
        var lineData = [{"x": lx[2*pos], "y": y}, {"x": lx[2*pos+1], "y": y}];
        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");
        buttons.append("path").attr("d", lineFunction(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .style("fill","none");
    }
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var leftTrianglePoints = xScale(0) + ' ' + yScale(140) + ', ' + xScale(30) + ' ' + yScale(122) +
        ', ' + xScale(30) + ' ' + yScale(158) + ' ' + xScale(30) + ', ' + yScale(158) + ' ' +
        xScale(0) + ' ' + yScale(140);
    var rightTrianglePoints = xScale(780) + ' ' + yScale(140) + ', ' + xScale(750) + ' ' +
        yScale(122) + ', ' + xScale(750) + ' ' + yScale(158) + ' ' + xScale(750) + ', ' +
        yScale(158) + ' ' + xScale(780) + ' ' + yScale(140);
    buttons.append('polyline')
        .attr('points', leftTrianglePoints).attr("stroke","none").style('fill', 'black');
    buttons.append('polyline')
        .attr('points', rightTrianglePoints).attr("stroke","none").style('fill', 'black');

    for(var m=0;m<6;m++){
        var radioButton = buttons.append("g").attr("transform","translate("+x[m]+","+y+")");
        radioButton.append("svg:image").attr("xlink:href","/resources/0.png").attr("class","choice").attr("id",m)
            .attr("x",0).attr("y",-16).attr("width",36).attr("height",36);
        radioButton.on({"mouseover": function(d) {d3.select(this).style("cursor", "pointer")},
            "mouseout": function(d) {d3.select(this).style("cursor", "default")}})
            .on("click",function(d){
                buttons.select(".no").attr("opacity",0.2);
                buttons.selectAll(".choice").attr("xlink:href","/resources/0.png");
                d3.select(this).select("image").attr("xlink:href","/resources/1.png");
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

// main study grading
function grading(){
    //init
    var grades = [],
        answers = {};
    for(var i=0;i<n_pair;i++){
        grades.push(0);
    }
    //retrieve answers
    for(var k in experimentr.data()['clicks']){
        answers[+experimentr.data()['clicks'][k][1]-1] = +experimentr.data()['clicks'][k][2];
    }
    //console.log(answers);
    for(var i in Object.keys(answers)){
        if(+answers[i]>2 && experimentr.data()['mat_answer'][+i]==1){
            grades[+i] = 1;
        }
        else if(+answers[i]<3 && experimentr.data()['mat_answer'][+i]==0){
            grades[+i] = 1;
        }
        else{
            grades[+i] = 0;
        }
    }
    var total = Object.values(grades).reduce((a, b) => a + b, 0);
    data['grades'] = grades;
    data['total_score'] = total;
    experimentr.addData(data);
}

// section2 grading
function grading2(){
    //init
    var grades = [],
        answers = {};
    for(var i=0;i<s2_n_pair;i++){
        grades.push(0);
    }
    //retrieve answers
    for(var k in experimentr.data()['s2_clicks']){
        answers[+experimentr.data()['s2_clicks'][k][1]-1] = +experimentr.data()['s2_clicks'][k][2];
    }
    for(var i in Object.keys(answers)){
        if(+answers[i]>2 && experimentr.data()['section2_answer'][+i]==1){
            grades[+i] = 1;
        }
        else if(+answers[i]<3 && experimentr.data()['section2_answer'][+i]==0){
            grades[+i] = 1;
        }
        else{
            grades[+i] = 0;
        }
    }
    var total = Object.values(grades).reduce((a, b) => a + b, 0);
    data['s2_grades'] = grades;
    data['s2_total_score'] = total;
    experimentr.addData(data);
}

/*
 Parsing for practice part
 */
function parsing2(route, dest){
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
        var new_group = {};

        for (var i = 0; i < raw_binary.length; i++) {
            var indice = raw_binary[i][0][raw_binary[i][0].length-2];
            if(!(indice in new_group)){
                new_group[indice] = [raw_binary[i]];
            }else{
                new_group[indice] = new_group[indice].concat([raw_binary[i]]);
            }
        }
        var keys = Object.keys(new_group);

        for(var key in keys){
            //console.log(key+1,new_group[+key+1]);
            binary = binary.concat([new_group[+key+1]]);
        }
        binary.push([]);
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

function parse_url() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}

/*
 Measure amount of disclosure
 */
function statictics(){
    var d = experimentr.data()['mat'];
    console.log(d);
}