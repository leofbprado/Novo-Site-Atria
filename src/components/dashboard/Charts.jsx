import React, { useEffect, useState } from "react";

// Lazy loading Chart.js para reduzir bundle
const ChartComponent = ({ type, data, options }) => {
  const [ChartComponent, setChartComponent] = useState(null);

  useEffect(() => {
    const loadChart = async () => {
      const [chartModule, chartjsModule] = await Promise.all([
        import('react-chartjs-2'),
        import('chart.js')
      ]);
      
      const { Line, Bar } = chartModule;
      const { Chart: ChartJS, registerables } = chartjsModule;
      
      ChartJS.register(...registerables);
      
      setChartComponent(() => type === 'bar' ? Bar : Line);
    };
    
    loadChart();
  }, [type]);

  if (!ChartComponent) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Carregando gráfico...
    </div>;
  }

  return <ChartComponent data={data} options={options} />;
};

const data = {
  labels: ["January", "February", "March", "April", "May", "June"],
  // Information about the dataset
  datasets: [
    {
      label: "Views",
      backgroundColor: "transparent",
      borderColor: "#1967D2",
      borderWidth: "1",
      data: [196, 132, 215, 362, 210, 252],
      pointRadius: 3,
      pointHoverRadius: 3,
      pointHitRadius: 10,
      pointBackgroundColor: "#1967D2",
      pointHoverBackgroundColor: "#1967D2",
      pointBorderWidth: "2",
      tension: 0.4,
    },
  ],
};

const options = {
  layout: {
    padding: 10,
  },

  legend: {
    display: false,
  },
  title: {
    display: false,
  },

  scales: {},

  tooltips: {
    backgroundColor: "#333",
    titleFontSize: 13,
    titleFontColor: "#fff",
    bodyFontColor: "#fff",
    bodyFontSize: 13,
    displayColors: false,
    xPadding: 10,
    yPadding: 10,
    intersect: false,
  },
};
const EarningsChart = () => {
  return <ChartComponent type="line" data={data} options={options} />;
};

export default EarningsChart;
