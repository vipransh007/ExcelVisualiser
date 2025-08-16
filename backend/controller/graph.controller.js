/*
File: backend/controller/graph.controller.js
Purpose: Contains the logic for handling graph-related requests.
*/
import asynchHandler from "../utils/asynchHandler.js";
import Graph from "../models/model.graphs.js"; // Corrected import
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getCommunityFeed = asynchHandler(async (req, res) => {
  // The number of random graphs you want to fetch.
  const sampleSize = 12; // Fetch 12 to make a nice 3 or 4 column grid

  // Use the Mongoose aggregate function with the $sample stage.
  const randomGraphs = await Graph.aggregate([
    // Optional: You could add a { $match: { isPublic: true } } stage here
    // if you add a public/private flag to your graphs in the future.
    { $sample: { size: sampleSize } }
  ]);

  if (!randomGraphs || randomGraphs.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No graphs found in the community feed."
    });
  }

  return res
    .status(200)
    .json({
      success: true,
      data: randomGraphs,
      message: "Community feed fetched successfully"
    });
});

const createChartFromCSV = asynchHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded"
      });
    }

    const { chartType, columns } = req.body;
    const parsedColumns = JSON.parse(columns);
    
    if (!chartType || !parsedColumns || parsedColumns.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing chart type or columns information"
      });
    }

    // Process CSV file
    const csvData = await processCSVFile(req.file.path);
    
    // Create chart data based on type
    let chartData;
    let chartLayout;
    
    switch (chartType) {
      case 'scatter':
        ({ data: chartData, layout: chartLayout } = createScatterPlot(csvData, parsedColumns));
        break;
      case 'line':
        ({ data: chartData, layout: chartLayout } = createLineChart(csvData, parsedColumns));
        break;
      case 'bar':
        ({ data: chartData, layout: chartLayout } = createBarChart(csvData, parsedColumns));
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported chart type"
        });
    }

    // Create new graph document
    const newGraph = new Graph({
      name: `CSV Chart - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)}`,
      description: `Automatically generated ${chartType} chart from uploaded CSV data`,
      data: chartData,
      layout: chartLayout,
      user: req.user?._id || '688871bf17e74c37c7187042', // Use authenticated user or default
      type: chartType,
      tags: ['csv-upload', chartType, 'auto-generated']
    });

    await newGraph.save();

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting uploaded file:', unlinkError);
    }

    return res.status(201).json({
      success: true,
      message: "Chart created successfully from CSV",
      data: newGraph
    });

  } catch (error) {
    console.error('Error creating chart from CSV:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create chart from CSV",
      error: error.message
    });
  }
});

// Helper function to process CSV file
const processCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper function to create scatter plot
const createScatterPlot = (data, columns) => {
  const numericColumns = columns.filter(col => 
    data.some(row => !isNaN(parseFloat(row[col])))
  );

  if (numericColumns.length < 2) {
    throw new Error('Need at least 2 numeric columns for scatter plot');
  }

  const xCol = numericColumns[0];
  const yCol = numericColumns[1];
  const colorCol = numericColumns[2] || null;

  const trace = {
    x: data.map(row => parseFloat(row[xCol]) || 0),
    y: data.map(row => parseFloat(row[yCol]) || 0),
    mode: 'markers',
    type: 'scatter',
    name: `${yCol} vs ${xCol}`,
    marker: {
      size: 8,
      opacity: 0.7,
      color: colorCol ? data.map(row => parseFloat(row[colorCol]) || 0) : '#3498db',
      colorscale: colorCol ? 'Viridis' : undefined,
      showscale: !!colorCol,
      colorbar: colorCol ? { title: colorCol } : undefined
    },
    text: data.map(row => 
      `${xCol}: ${row[xCol]}<br>${yCol}: ${row[yCol]}${colorCol ? `<br>${colorCol}: ${row[colorCol]}` : ''}`
    ),
    hoverinfo: 'text'
  };

  const layout = {
    title: {
      text: `Scatter Plot: ${yCol} vs ${xCol}`,
      font: { size: 18, color: '#2c3e50' }
    },
    xaxis: {
      title: { text: xCol, font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: { text: yCol, font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    hovermode: 'closest',
    margin: { l: 60, r: 30, t: 60, b: 60 }
  };

  return { data: [trace], layout };
};

// Helper function to create line chart
const createLineChart = (data, columns) => {
  const numericColumns = columns.filter(col => 
    data.some(row => !isNaN(parseFloat(row[col])))
  );

  if (numericColumns.length < 1) {
    throw new Error('Need at least 1 numeric column for line chart');
  }

  const traces = numericColumns.map((col, index) => ({
    x: data.map((row, i) => i), // Use index as x-axis
    y: data.map(row => parseFloat(row[col]) || 0),
    mode: 'lines+markers',
    type: 'scatter',
    name: col,
    line: { 
      color: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'][index % 5],
      width: 2 
    },
    marker: { size: 4 },
    text: data.map(row => `${col}: ${row[col]}`),
    hoverinfo: 'text'
  }));

  const layout = {
    title: {
      text: 'Line Chart: Time Series Data',
      font: { size: 18, color: '#2c3e50' }
    },
    xaxis: {
      title: { text: 'Data Point Index', font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: { text: 'Values', font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    hovermode: 'closest',
    legend: { x: 0.02, y: 0.98 },
    margin: { l: 60, r: 30, t: 60, b: 60 }
  };

  return { data: traces, layout };
};

// Helper function to create bar chart
const createBarChart = (data, columns) => {
  // For bar chart, we'll use the first column as categories and second as values
  const categoryCol = columns[0];
  const valueCol = columns[1] || columns[0];

  // Group data by category if needed
  let chartData;
  if (columns.length >= 2 && data.some(row => !isNaN(parseFloat(row[valueCol])))) {
    // Use first column as categories, second as values
    chartData = data.map(row => ({
      category: row[categoryCol] || 'Unknown',
      value: parseFloat(row[valueCol]) || 0
    }));
  } else {
    // Count frequency of first column
    const frequency = {};
    data.forEach(row => {
      const category = row[categoryCol] || 'Unknown';
      frequency[category] = (frequency[category] || 0) + 1;
    });
    
    chartData = Object.entries(frequency).map(([category, value]) => ({
      category,
      value
    }));
  }

  const trace = {
    x: chartData.map(item => item.category),
    y: chartData.map(item => item.value),
    type: 'bar',
    name: 'Frequency',
    marker: {
      color: '#3498db',
      opacity: 0.8
    },
    text: chartData.map(item => item.value.toString()),
    textposition: 'auto',
    hovertemplate: 
      '<b>Category: %{x}</b><br>' +
      'Value: %{y}<br>' +
      '<extra></extra>'
  };

  const layout = {
    title: {
      text: `Bar Chart: ${categoryCol} Distribution`,
      font: { size: 18, color: '#2c3e50' }
    },
    xaxis: {
      title: { text: categoryCol, font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    yaxis: {
      title: { text: 'Frequency/Value', font: { size: 14 } },
      gridcolor: '#ecf0f1',
      zerolinecolor: '#bdc3c7'
    },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    hovermode: 'closest',
    margin: { l: 60, r: 30, t: 60, b: 60 }
  };

  return { data: [trace], layout };
};

export { getCommunityFeed, createChartFromCSV };
