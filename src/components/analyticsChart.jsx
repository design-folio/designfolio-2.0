import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { _analytics } from "@/network/post-request";
import { useTheme } from "next-themes";

function AnalyticsChart({ duration, setUniqueVisits }) {
  const [svgIcon, setSvgIcon] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Unique visitors",
        data: [],
        borderColor: "rgba(141, 186, 248, 0.7)",
        backgroundColor: "rgba(141, 186, 248, 1)",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  });
  const [loading, setLoading] = useState(true); // Track loading state

  // Use useMemo to memoize options
  const options = useMemo(() => {
    // Check for dark theme and apply corresponding styles
    const isDarkMode = theme === "dark";
    ChartJS.defaults.color = isDarkMode ? "#ffffff" : "#17172A"; // White for dark mode, dark color for light mode

    return {
      responsive: true, // Make the chart responsive
      maintainAspectRatio: false, // Allow the height to adjust based on the container
      plugins: {
        colors: {
          forceOverride: true,
          enabled: false
        },
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            font: {
              size: 14
            },
            generateLabels: (chart) => {
              const original =
                ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
              return original.map((label) => ({
                ...label,
                pointStyle: svgIcon, // Use the loaded SVG image as a point style
              }));
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          borderColor: "transparent", // Set the Y-axis border to transparent to hide the vertical line
          grid: {
            display: true, // Keep horizontal grid lines
            color: isDarkMode ? "#606273" : "#E1E1E1", // Dark grid lines for dark mode, light grid lines for light mode
            lineWidth: 1, // Set the line width to 1px
            borderDash: [], // Remove any dash pattern
            drawTicks: true,
          },
          ticks: {
            display: true,
            font: {
              weight: 900,
              size: 12,
            },
            callback: function (value) {
              return Number.isInteger(value) ? value : ''; // Removes decimals and shows only whole numbers
            },
          },
        },
        x: {
          borderColor: isDarkMode ? '#1D1F27' : '#565656', // Dark color for dark mode, lighter color for light mode
          grid: {
            display: false, // Remove vertical grid lines
          },
          ticks: {
            display: true,
            rotation: 0,
            maxRotation: 0, // Prevent label rotation
            minRotation: 0, // Prevent label rotation
            autoSkip: true, // Disable auto skipping of labels
          },
        },
      },
      elements: {
        line: {
          color: isDarkMode ? '#606273' : 'rgba(141, 186, 248, 0.7)', // Line color for dark mode and light mode
        },
      },
    };
  }, [svgIcon, theme]); // Only recompute when svgIcon or theme changes
  

  const fetchAnalytics = async (durationQuery) => {
    const response = await _analytics(durationQuery);
    const { visitors } = response.data;

    if (visitors) {
      let labels = [];
      let data = [];

      if (durationQuery === "day") {
        // For 'day' duration, generate the last 24 hours dynamically
        const currentDate = new Date();
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(currentDate);
          hour.setHours(currentDate.getHours() - i, 0, 0, 0); // Subtract hours from current time

          // Format date to show last 24 hours like "Nov 8, 12:00 AM"
          const label = hour.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          labels.push(label);

          // Find count for that specific hour
          const countForHour = visitors
            .filter((item) => {
              const visitorHour = new Date(item.date).getHours();
              return visitorHour === hour.getHours();
            })
            .reduce((acc, item) => acc + item.count, 0); // Sum counts for that hour

          data.push(countForHour);
        }
      } else {
        // For other durations (Week, Month), use the data as it is
        labels = visitors.map((item) => {
          // Format the date to a more readable form (e.g., "Nov 8")
          return new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        });

        data = visitors.map((item) => item.count);
      }

      // Reverse the order of dates and data to have the most recent hour on the right
      if (durationQuery != "day") {
        labels = labels.reverse();
        data = data.reverse();
      }

      // Calculate the total count of visitors
      const totalCount = data.reduce((acc, count) => acc + count, 0);

      setUniqueVisits(totalCount);

      setChartData({
        labels,
        datasets: [
          {
            label: `Unique visitors`,
            data,
            borderColor: "rgba(141, 186, 248, 0.7)",
            backgroundColor: "rgba(141, 186, 248, 1)",
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
      setLoading(false); // Set loading to false once data is fetched and chart is ready
    }
  };

  // Load the SVG image once the component mounts
  useEffect(() => {
    if (!svgIcon) {
      const img = new Image();
      img.src = "./assets/svgs/legendVisitor.svg"; // Path to your SVG file
      img.onload = () => {
        setSvgIcon(img); // Set the loaded SVG image in the state
      };
    }

    // Handle duration change and mapping to backend variable
    let durationQuery =
      duration === "Week"
        ? "week"
        : duration === "Today"
        ? "day"
        : duration === "This Month"
        ? "month"
        : null;

    if (durationQuery) {
      fetchAnalytics(durationQuery);
    }

    return () => {
      // Cleanup function to destroy chart instance if it's manually set
      if (chartInstance) {
        chartInstance.destroy(); // Ensure the chart is destroyed before re-render
      }
    };
  }, [svgIcon, duration]); // Only rerun effect if `duration` or `svgIcon` changes

  // If the SVG is not loaded yet, or the data is still loading, we can return a loading spinner
  if (loading) {
    return <div></div>; // Or use a spinner component here
  }

  return (
    <div className="w-full h-[60vh] md:h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default AnalyticsChart;
