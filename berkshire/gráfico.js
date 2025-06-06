document.addEventListener("DOMContentLoaded", function() {
  Apex.chart = {
    locales: [{
      "name": "pt-br",
      "options": {
        "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        "toolbar": {
          "exportToSVG": "Baixar SVG",
          "exportToPNG": "Baixar PNG",
          "exportToCSV": "Baixar CSV",
          "menu": "Menu",
          "selection": "Seleção",
          "selectionZoom": "Zoom na Seleção",
          "zoomIn": "Aumentar Zoom",
          "zoomOut": "Diminuir Zoom",
          "pan": "Navegar",
          "reset": "Resetar Zoom"
        }
      }
    }],
    defaultLocale: "pt-br"
  };

  const options = {
    series: [{
      name: 'Preço',
      data: []
    }],
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2.5
    },
    colors: ['#0057b3'],
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.6,
            opacityTo: 0.05,
            stops: [0, 100]
        }
    },
    title: {
      text: 'Desempenho do Ativo (BRL)',
      align: 'left',
      style: {
        fontSize: '18px',
        fontFamily: 'Cormorant, serif',
        color: '#262626',
        fontWeight: 600
      }
    },
    subtitle: {
        text: 'Dados diários da B3 fornecidos por Alpha Vantage',
        align: 'left',
         style: {
            fontSize: '14px',
            fontFamily: 'Cormorant, serif',
            color: '#737373'
        }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM', 
        datetimeUTC: false,
        style: {
           fontFamily: 'Cormorant, serif',
           colors: '#555'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: 'Cormorant, serif',
          colors: '#555'
        },
        formatter: function (value) {
          if (typeof value !== 'number') return value;
          return "R$ " + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      },
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      x: {
        format: 'dd MMMM yyyy'
      },
      y: {
        formatter: function (value) {
           return "R$ " + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
    },
  };

  const chart = new ApexCharts(document.querySelector("#stockChart"), options);
  chart.render();
  
  const loadingEl = document.getElementById('loading');
  const stockChartEl = document.getElementById('stockChart');

  const apiKey = 'DEMO';
  const symbol = 'BERK34.SA'; 
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

  let lastDataPoint = null;

  async function fetchInitialData() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        console.error("Erro ao buscar dados da API:", data);
        const errorMessage = data['Note'] 
            ? "O limite de requisições da API de demonstração foi atingido. Tente novamente mais tarde."
            : "Não foi possível carregar os dados das ações. A API pode estar indisponível.";
        loadingEl.innerText = errorMessage;
        return;
      }

      const seriesData = Object.keys(timeSeries).map(timestamp => {
        return {
          x: new Date(timestamp).getTime(),
          y: parseFloat(timeSeries[timestamp]['4. close'])
        };
      }).reverse(); 

      chart.updateSeries([{
        data: seriesData
      }]);
      
      if(seriesData.length > 0) {
        lastDataPoint = seriesData[seriesData.length - 1];
      }

      loadingEl.style.display = 'none';
      stockChartEl.style.display = 'block';

      startRealTimeSimulation();

    } catch (error) {
      console.error("Erro de conexão:", error);
      loadingEl.innerText = "Erro de conexão ao tentar buscar dados das ações.";
    }
  }

  function startRealTimeSimulation() {
    setInterval(() => {
      if (!lastDataPoint) return;
      
      const lastPrice = lastDataPoint.y;
      const randomFactor = (Math.random() - 0.48) * (lastPrice * 0.001);
      const newPrice = parseFloat((lastPrice + randomFactor).toFixed(2));

      const newTimestamp = lastDataPoint.x + (24 * 60 * 60 * 1000); 
      const newDataPoint = {
          x: newTimestamp, 
          y: newPrice
      };
      
      chart.appendData([{
          data: [newDataPoint]
      }]);
      
      lastDataPoint = newDataPoint;

    }, 8000); 
  }

  fetchInitialData();
});
