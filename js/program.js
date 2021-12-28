 var mapSeries;
var mapChart;
var tableCharts;
var dataSet;
var tableChart;
var populationChart;
var areaChart;
var houseSeatsChart;

anychart.onDocumentReady(function () {
  // The data used in this sample can be obtained from the CDN
  // https://cdn.anychart.com/samples/maps-in-dashboard/states-of-united-states-dashboard-with-multi-select/data.json
  anychart.data.loadJsonFile(
    'https://datamexico.org/api/data.jsonrecords?cube=gobmx_covid_stats_mun&drilldowns=Municipality&measures=Accum+Cases,Daily+Cases,AVG+7+Days+Accum+Cases,AVG+7+Days+Daily+Cases,Rate+Daily+Cases,Rate+Accum+Cases,Days+from+50+Cases&s=Daily%20New%20Cases&r=rollingMeanOption&locale=es&time=time.latest&State=20',
    function (dataRaw) {
      data = dataRaw.data;

      // pre-processing of the data
      for (var i = 0; i < data.length; i++) {
        data[i].value = data[i]["Daily Cases"];
        data[i].short = parseInt((''+data[i]["Municipality ID"]).substring(1));
        data[i].id = data[i]["Municipality ID"];
      }
      dataSet = anychart.data.set(data);
      tableChart = getTableChart();
      mapChart = drawMap();
      tableCharts = getTableCharts();

      // Setting layout table
      var layoutTable = anychart.standalones.table();
      layoutTable.cellBorder(null);
      layoutTable.container('container');
      layoutTable.draw();

      function getTableChart() {
        var table = anychart.standalones.table();
        table.cellBorder(null);
        table.fontSize(11).vAlign('middle').fontColor('#212121');
        table
          .getCell(0, 0)
          .colSpan(8)
          .fontSize(14)
          .vAlign('bottom')
          .border()
          .bottom('1px #dedede')
          .fontColor('#7c868e');
        table
          .useHtml(true)
          .contents([
            ['Lista de municipios seleccionados'],
            [
              null,
              'Name',
              'Capital',
              'Largest<br/>City',
              'State<br/>Since',
              'Population',
              'Area',
              'House<br/>Seats'
            ],
            [null]
          ]);
        table
          .getRow(1)
          .cellBorder()
          .bottom('2px #dedede')
          .fontColor('#7c868e');
        table.getRow(0).height(45).hAlign('center');
        table.getRow(1).height(35);
        table.getCol(0).width(25);
        table.getCol(1).hAlign('left');
        table.getCol(2).hAlign('left');
        table.getCol(3).hAlign('left');
        table.getCol(2).width(50);
        table.getCol(4).width(50);
        table.getCol(5).width(50);
        return table;
      }

      function solidChart(value) {
        var gauge = anychart.gauges.circular();
        gauge.data([value, 100]);
        gauge.padding(5);
        gauge.margin(0);
        var axis = gauge.axis().radius(100).width(1).fill(null);
        axis
          .scale()
          .minimum(0)
          .maximum(100)
          .ticks({ interval: 1 })
          .minorTicks({ interval: 1 });
        axis.labels().enabled(false);
        axis.ticks().enabled(false);
        axis.minorTicks().enabled(false);

        var stroke = '1 #e5e4e4';
        gauge
          .bar(0)
          .dataIndex(0)
          .radius(80)
          .width(40)
          .fill('#64b5f6')
          .stroke(null)
          .zIndex(5);
        gauge
          .bar(1)
          .dataIndex(1)
          .radius(80)
          .width(40)
          .fill('#F5F4F4')
          .stroke(stroke)
          .zIndex(4);
        gauge
          .label()
          .width('50%')
          .height('25%')
          .adjustFontSize(true)
          .hAlign('center')
          .anchor('center');
        gauge
          .label()
          .hAlign('center')
          .anchor('center')
          .padding(5, 10)
          .zIndex(1);
        gauge.background().enabled(false);
        gauge.fill(null);
        gauge.stroke(null);
        return gauge;
      }

      function getTableCharts() {
        var table = anychart.standalones.table(2, 3);
        table.cellBorder(null);
        table.getRow(0).height(45);
        table.getRow(1).height(25);
        table.fontSize(11).useHtml(true).hAlign('center');
        table
          .getCell(0, 0)
          .colSpan(3)
          .fontSize(14)
          .vAlign('bottom')
          .border()
          .bottom('1px #dedede');
        table.getRow(1).cellBorder().bottom('2px #dedede');
        populationChart = solidChart(0);
        areaChart = solidChart(0);
        houseSeatsChart = solidChart(0);
        table.contents([
          ['Percentage of Total'],
          ['AVG 7 Days Accum Cases', 'AVG 7 Days Daily Cases'],
          [populationChart, areaChart]
        ]);
        return table;
      }

      function changeContent(ids) {
        var i;
        var contents = [
          ['Lista de municipios seleccionados'],
          [
            null,
            'Municipio',
            'Daily Cases',
            'AVG 7 Days Accum Cases',
            'AVG 7 Days Daily Cases'
          ]
        ];
        var population = 0;
        var area = 0;
        var seats = 0;
        for (i = 0; i < ids.length; i++) {
          var data = getDataId(ids[i]);
          population += parseInt(data["AVG 7 Days Accum Cases"]);
          area += parseInt(data["AVG 7 Days Accum Cases"]);
          seats += parseInt(data["AVG 7 Days Daily Cases"]);

          var label = anychart.standalones.label();

          contents.push([
            "",
            data["Municipality"],
            data["Daily Cases"],
            parseInt(data["AVG 7 Days Accum Cases"]).toLocaleString(),
            parseInt(data["AVG 7 Days Daily Cases"]).toLocaleString()
          ]);
        }

        populationChart.data([
          ((population * 100) / getDataSum("AVG 7 Days Accum Cases")).toFixed(2),
          100
        ]);
        populationChart
          .label()
          .text(
            ((population * 100) / getDataSum("AVG 7 Days Accum Cases")).toFixed(2) +
            '%'
          );

        areaChart.data([
          ((seats * 100) / getDataSum("AVG 7 Days Daily Cases")).toFixed(2),
          100
        ]);
        areaChart
          .label()
          .text(((seats * 100) / getDataSum("AVG 7 Days Daily Cases")).toFixed(2) + '%');

        tableChart.contents(contents);
        for (i = 0; i < ids.length; i++) {
          tableChart.getRow(i + 2).maxHeight(15);
        }
      }

      function drawMap() {
        var map = anychart.map();
        // set map title settings using html
        map.title().padding(10, 0, 10, 0).margin(0).useHtml(true);
        map.title(
          'OAXACA'+
          '<br/><span style="color:#212121; font-size: 11px;">Daq click en un municipio para seleccionarlo</span>'
        );
        map.padding([0, 0, 20, 0]);

        // set map Geo data
        map.geoData('anychart.maps.oaxaca');

        map.listen('pointsSelect', function (e) {
          console.log("e "+ e);
          var selected = [];
          console.log("e.seriesStatus[0] >>> "+e.seriesStatus[0]);

          var selectedPoints = e.seriesStatus[0].points;
          console.log("selectedPoints >>> "+selectedPoints);
          for (var i = 0; i < selectedPoints.length; i++) {
            selected.push(selectedPoints[i].id);
          }
          changeContent(selected);
        });

        mapSeries = map.choropleth(dataSet);
        mapSeries.geoIdField('CVEGEO');
        mapSeries.labels(null);
        mapSeries.tooltip().useHtml(true);
        mapSeries.tooltip().title().useHtml(true);
        mapSeries.tooltip().titleFormat(function () {
          var data = getDataId(this.id);
          return (
            data.Municipality
          );
        });
        mapSeries.tooltip().format(function () {
          var data = getDataId(this.id);
          return (
              '<span style="font-size: 12px; color: #b7b7b7">Casos: </span>' +
            data["Daily Cases"] +
            '<br/>' +
            '<span style="font-size: 12px; color: #b7b7b7">Total '+
            '<span style="font-size: 10px"> ( ultimos 7 dias )</span> </span>' +
            parseInt(data["AVG 7 Days Accum Cases"])
          );
        });
        var scale = anychart.scales.ordinalColor([
          { less: 10 },
          { from: 20, to: 30 },
          { from: 40, to: 50 },
          { from: 50, to: 60 },
          { from: 70, to: 80 },
          { from: 80, to: 90 },
          { greater: 100 }
        ]);
        scale.colors([
          '#81d4fa',
          '#4fc3f7',
          '#29b6f6',
          '#039be5',
          '#0288d1',
          '#0277bd',
          '#01579b'
        ]);
        mapSeries.hovered().fill('#f06292');
        mapSeries
          .selected()
          .fill('#c2185b')
          .stroke(anychart.color.darken('#c2185b'));
        mapSeries.colorScale(scale);

        mapSeries.stroke(function () {
          this.iterator.select(this.index);
          var pointValue = this.iterator.get(this.referenceValueNames[1]);
          var color = this.colorScale.valueToColor(pointValue);
          return anychart.color.darken(color);
        });

        var colorRange = map.colorRange();
        colorRange.enabled(true);
        colorRange
          .ticks()
          .stroke('3 #ffffff')
          .position('center')
          .length(20)
          .enabled(true);
        colorRange.colorLineSize(5);
        colorRange
          .labels()
          .fontSize(11)
          .padding(0, 0, 0, 0)
          .format(function () {
            var range = this.colorRange;
            var name;
            if (isFinite(range.start + range.end)) {
              name = range.start + ' - ' + range.end;
            } else if (isFinite(range.start)) {
              name = 'After ' + range.start;
            } else {
              name = 'Before ' + range.end;
            }
            return name;
          });
        return map;
      }

      // Creates general layout table with two inside layout tables
      function fillInMainTable(flag) {
        if (flag === 'wide') {
          layoutTable.contents(
            [
              [mapChart, tableCharts],
              [null, tableChart]
            ],
            true
          );
          layoutTable.getCell(0, 0).rowSpan(2);
          layoutTable.getRow(0).height(null);
          layoutTable.getRow(1).height(null);
        } else {
          layoutTable.contents(
            [[mapChart], [tableCharts], [tableChart]],
            true
          );
          layoutTable.getRow(0).height(450);
          layoutTable.getRow(1).height(400);
          layoutTable.getRow(2).height(550);
        }
        layoutTable.draw();
      }

      if (window.innerWidth > 768) fillInMainTable('wide');
      else {
        fillInMainTable('slim');
      }
      //mapSeries.select(12);
      //mapSeries.select(13);
      //mapSeries.select(14);
      //mapSeries.select(16);
      //changeContent(['US.IN', 'US.KY', 'US.IL', 'US.IA']);

      // On resize changing layout to mobile version or conversely
      window.onresize = function () {
        if (layoutTable.colsCount() === 1 && window.innerWidth > 767) {
          fillInMainTable('wide');
        } else if (
          layoutTable.colsCount() === 2 &&
          window.innerWidth <= 767
        ) {
          fillInMainTable('slim');
        }
      };

      function getDataId(id) {
        for (var i = 0; i < data.length; i++) {
          if (parseInt(data[i].id) === parseInt(id)) return data[i];
        }
      }

      function getDataSum(field) {
        var result = 0;
        for (var i = 0; i < data.length; i++) {
          result += parseInt(data[i][field]);
        }
        return result;
      }
    }
  );
});