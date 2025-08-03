/*
File: backend/controller/graph.controller.js
Purpose: Contains the logic for handling graph-related requests.
*/
import asynchHandler from "../utils/asynchHandler.js";
import  Graph  from "../models/model.graphs.js"; // Corrected import

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

export { getCommunityFeed };
