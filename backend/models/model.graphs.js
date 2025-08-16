import mongoose from "mongoose";

const GraphSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  name: {
    type: String,
    default: 'Untitled Graph',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  layout: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  
  description: String,
  type: {
    type: String,
    enum: ['scatter', 'line', 'bar', 'pie', 'histogram'],
    default: 'scatter'
  },
  tags: [{
    type: String
  }],
}, { timestamps: true });

const Graph = mongoose.model('Graph', GraphSchema);
export default Graph;