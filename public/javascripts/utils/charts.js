/**
 * Created by erinci on 08.04.2015.
 */
/**
 Stats Page Charts
 **/
function generateDeployPie(divId, data) {
    var deploysPieChart = AmCharts.makeChart(divId, {
        "type": "pie",
        "title": "Deploys",
        "theme": "light",
        "width": "100%",
        "height": "100%",
        "dataProvider": [{
            "status": "Successful",
            "deploys": data.deploysSuccess,
            "color": "#b0de09"
        }, {
            "status": "Failed",
            "deploys": data.deploysFail,
            "color": "#de1a37"
        }, {
            "status": "Rollbacks",
            "deploys": data.rollbacks,
            "color": "#ff9e01"
        }],
        "colorField": "color",
        "valueField": "deploys",
        "titleField": "status",
        "outlineAlpha": 0.4,
        "depth3D": 15,
        "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
        "angle": 30
    });
    //deploysPieChart.addTitle("Deploys");
    deploysPieChart.addListener("rendered", function(event) {
        $('.chart-curtain').hide();
    });
}

function generateAvgDeployTimeGraph(divId, data) {
    var avgDeployTimesGraph = AmCharts.makeChart(divId, {
        "type": "serial",
        "theme": "none",
        "marginLeft": 20,
        "pathToImages": "/javascripts/amcharts/images/",

        "dataProvider": data.avgDeployTimes,
        "valueAxes": [{
            "axisAlpha": 0,
            "inside": true,
            "position": "left",
            "ignoreAxisWidth": true,
            "title": "Average Deploy time (ms)"
        }],

        //"dataDateFormat": "DD-MM-YYYY",
        "categoryField": "date",
        "categoryAxis": {
            "minPeriod": "mm",
            "parseDates": true,
            //"dataDateFormat": "DD-MM-YYYY HH:MM",
            "axisAlpha": 0,
            "minHorizontalGap":25,
            "gridAlpha": 0.15,
            "tickLength": 0
        },
        
        "graphs": [{
            "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]] ms</span></b>",
            "bullet": "round",
            "bulletSize": 9,
            "lineColor": "#d1655d",
            "lineThickness": 2,
            "negativeLineColor": "#637bb6",
            "type": "smoothedLine",
            "valueField": "avg"
        }]
    });
    avgDeployTimesGraph.addListener("rendered", function(event) {
        $('.chart-curtain').hide();
    });
}