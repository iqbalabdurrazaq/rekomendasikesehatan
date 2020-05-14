//Flot Line Chart
$(document).ready(function() {
    console.log("document ready");

    document.getElementById("avgN1").style.display = "none";
    var offset = 0;
    getHum();
    function getHum()
    {
      var xNo = new Array();
      var yHum = new Array();
      var url = "http://localhost/rekomendasikesehatan/Raspi04/api/apiGetDataJson_temp.php";
      $.ajax({   
      type: "GET",    
        url: url,
        dataType: 'json',
        cache: false,
        success: function(response){           
          for(i=0;i<response.records.length;i++){
            xNo[i] = response.records[i].no;
            yHum[i] = parseInt(response.records[i].temp);
            console.log(yHum[i]);                  
          }
          predictHum(xNo, yHum);
        }            
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        // Request failed. Show error message to user. 
        // errorThrown has error message.
        alert("a" +errorThrown);
      });
    }

  function predictHum(X, Y)
  {
    var options = {
        series: {
            lines: {
                show: true
            },
            points: {
                show: false
            }
        },
        grid: {
            hoverable: true //IMPORTANT! this is needed for tooltip to work
        },
        yaxis: {
            min: 0,
            max: 100
        },
        tooltip: true,
        tooltipOpts: {
            //content: "'%s' of %x.1 is %y.4",
            shifts: {
                x: -60,
                y: 25
            }
        }
    };


    var forcast = new Array();
    var tmpN = new Array();
    var tmpF = new Array();
    var tmpEror = new Array();
    var tmpEror2 = new Array();
    var mad1 = new Array();
    var mad2 = new Array();
    var mse1 = new Array();
    var mse2 = new Array();
    var mape2 = new Array();
    var mape1 = new Array();
    var Slope, Intercept, SX = 0, SY = 0,
              SXX = 0, SXY = 0, SYY = 0,
              SumProduct = 0, N = X.length;

    var a, b;
    var lastT=0;
    console.log("------- Data Asli ---------")
    console.log(Y);

    for (var i = 0; i < N; i++) {
      SX = SX + X[i];
      SY = SY + Y[i];
      SXY = SXY + X[i] * Y[i];
      SXX = SXX + X[i] * X[i];
      SYY = SYY + Y[i] * Y[i];
    }

    Slope = ((N * SXY) - (SX * SY)) / ((N * SXX) - (SX * SX));
    Intercept = (SY - (Slope * SX)) / N;

    for (var i = 0; i < N; i++) {
      forcast[i] = (parseFloat(X[i]) * parseFloat(Slope)) + parseFloat(Intercept);
      var tmpX = X[N-1];
      tmpN[i] = parseFloat(tmpX) + parseFloat(X[i]);
      tmpF[i] = (parseFloat(tmpN[i]) * parseFloat(Slope)) + parseFloat(Intercept);
      tmpEror[i] =  parseFloat(Y[i]) - parseFloat(forcast[i])
      tmpEror2[i] =  parseFloat(tmpF[i]) - parseFloat(tmpF[i])
      mad1[i] = Math.abs(tmpEror[i])
      mad2[i] = Math.abs(tmpEror2[i])
      mse1[i] = Math.pow(mad1[i], 2)
      mse2[i] = Math.pow(mad2[i], 2)
      mape1[i] = mad1[i] / Y[i] *100
      mape2[i] = mad2[i] / Y[i] *100
      lastT=lastT+1;
    }

    console.log("Last T = " +lastT);

    console.log("------- Data Trend Production  ---------")
    console.log(forcast);
    console.log("------- Forecast Error  ---------")
    console.log(tmpEror);
    console.log("------- MSE  ---------")
    console.log(mse1);
    console.log("------- MAD  ---------")
    console.log(mad1);
    console.log("------- MAPE  ---------")
    console.log(mape1);

    var avgAR = 0

    for(i=0;i<tmpF.length;i++)
    {
      avgAR = parseInt(avgAR) + parseInt(tmpF[i]);
    }
    avgAR = avgAR / tmpF.length;
    console.log("------- Rata-Rata AR  ---------")
    console.log(Number(avgAR));
    

    var nErr = 0
    for(i=0;i<tmpEror.length;i++)
    {
      nErr = nErr + tmpEror[i];
    }
    nErr = nErr / tmpEror.length;    
    console.log("------- Rata-Rata Error  ---------")
    console.log(Number(nErr));

    var nMape = 0
    for (var i = 0; i < mape1.length; i++) {
      nMape = nMape + mape1[i];
    }
    nMape = nMape / mape1.length;
    console.log("------- Rata-Rata Mape  ---------")
    console.log(Number(nMape));

    var nMad = 0
    for (var i = 0; i < mad1.length; i++) {
      nMad = nMad + mad1[i];
    }
    nMad = nMad / mad1.length;
    console.log("------- Rata-Rata Mad  ---------")
    console.log(Number(nMad));

    var nMse = 0
    for (var i = 0; i < mad1.length; i++) {
      nMse = nMse + mse1[i];
    }
    nMse = nMse / mse1.length;
    console.log("------- Rata-Rata Mse  ---------")
    console.log(Number(nMse));

    console.log("------- Y Prediksi  ---------")
    yPred = avgAR;
    yPred = yPred.toFixed(2);
    console.log(yPred);

    
    // Plot Ke Chart ------------------------------------
    var dataOri = [],
        dataPredict = [];

    for (var i = 0; i < Y.length; i++) {
        ny = parseInt(Y[i]);
        dataOri.push([i, ny]);  
    }
    for (var i = 0; i < forcast.length; i++) {
        pY = parseFloat(forcast[i]);
        dataPredict.push([i, pY]);        
    }

    var plotObj = $.plot($("#flot-line-chart1"), [{
            data: dataOri,
            label: "data Original"
        }, {
            data: dataPredict,
            label: "data Prediksi"
        }],
    options);

    var dataLongPredict = [];
    for(i=0;i<tmpF.length;i++)
    {
      newY = parseFloat(tmpF[i]);
      dataLongPredict.push([i, newY]);
    }

    var plotObj2 = $.plot($("#flot-line-chart2"), [{
            data: dataLongPredict,
            label: "data Prediksi " 
        }],
    options);
    // ------------------------------------------------------------

    vErr = nErr;
    vMad = nMad.toFixed(3);
    vMse = nMse.toFixed(3);
    vMape = nMape.toFixed(3);
    document.getElementById('avgData1').innerHTML = "Rata-Rata : " +yPred;
    document.getElementById('avgData2').innerHTML = "Forecast Error : <b>" +vErr +"<b>";
    document.getElementById('avgMse1').innerHTML = "Mean Square Error: <b>" + vMse+"<b>";
    document.getElementById('avgMape1').innerHTML = "Mean Absolute Persen Error: <b>" + vMape +"<b>";
    document.getElementById('avgMad1').innerHTML = "Mean Absolute Deviation Error: <b>" + vMad +"<b>";
    document.getElementById('avgN1').innerHTML = yPred;
  }  
});