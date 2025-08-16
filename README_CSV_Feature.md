# CSV Upload & Chart Creation Feature

## 🎯 **Overview**
This feature allows users to upload CSV files and automatically convert them into interactive charts using the same chart types we've implemented in our seed files.

## 📊 **Supported Chart Types**

### 1. **Scatter Plot**
- **Best for**: Relationships between two numeric variables
- **Examples**: Age vs Blood Pressure, CGPA vs Salary, Height vs Weight
- **Requirements**: At least 2 numeric columns
- **Features**: Optional third column for color coding

### 2. **Line Chart**
- **Best for**: Time series data, trends over time
- **Examples**: Sales over time, Temperature changes, Stock prices
- **Requirements**: At least 1 numeric column
- **Features**: Multiple lines for different variables

### 3. **Bar Chart**
- **Best for**: Categorical data, frequency distributions
- **Examples**: Product categories, Survey responses, Ride types
- **Requirements**: At least 1 column (auto-counts frequency)
- **Features**: Can use second column for custom values

## 🚀 **How to Use**

### **Step 1: Upload CSV File**
- Click "Create Chart" button
- Choose your CSV file (must be .csv format)
- File will be automatically analyzed

### **Step 2: Choose Chart Type**
- Select from the 3 available chart types
- System will recommend the best type based on your data
- Each type shows description and examples

### **Step 3: Preview Your Data**
- See detected columns and first 5 rows
- Verify data structure is correct
- Check column names and data types

### **Step 4: Create Chart**
- Click "Create Chart" button
- System automatically generates the visualization
- Chart is saved to database and appears in community feed

## 📁 **CSV Format Requirements**

### **General Guidelines**
- First row should contain column headers
- Data should start from second row
- Use commas to separate values
- Avoid special characters in column names

### **For Scatter Plots**
```
Age,BloodPressure,Gender
25,120,Male
30,125,Female
35,130,Male
```

### **For Line Charts**
```
Date,Temperature,Humidity
2024-01-01,25,60
2024-01-02,26,65
2024-01-03,24,58
```

### **For Bar Charts**
```
Category,Count
Product A,150
Product B,200
Product C,100
```

## 🔧 **Technical Implementation**

### **Frontend Components**
- `CreateChart.jsx` - Main upload interface
- `Navigation.jsx` - Switch between views
- `ChartsDisplay.jsx` - Updated to include both views

### **Backend Endpoints**
- `POST /api/v1/graphs/create-from-csv` - Handle CSV uploads
- Uses `multer` for file handling
- Automatic chart generation based on data analysis

### **Chart Generation Logic**
- **Scatter Plot**: Uses first 2 numeric columns, optional 3rd for color
- **Line Chart**: Uses all numeric columns as separate lines
- **Bar Chart**: Counts frequency of first column or uses second column values

## 🎨 **Features**

### **Smart Recommendations**
- System analyzes your data and recommends the best chart type
- Detects date columns for time series
- Identifies numeric vs categorical data

### **Data Preview**
- See your data before creating the chart
- Verify column detection is correct
- Preview first 5 rows for validation

### **Automatic Cleanup**
- Uploaded files are automatically deleted after processing
- No temporary files left on server
- Efficient memory management

### **Error Handling**
- Validates CSV format
- Checks for required data types
- Provides clear error messages

## 🚨 **Limitations & Considerations**

### **File Size**
- Large CSV files may take longer to process
- Consider sampling very large datasets

### **Data Quality**
- Missing values are handled gracefully
- Non-numeric data in numeric columns will be ignored
- Empty rows are automatically filtered

### **Column Detection**
- System automatically detects data types
- Column names should be descriptive
- Avoid duplicate column names

## 🔄 **Integration with Community Feed**

- Newly created charts automatically appear in the community feed
- Charts are tagged with `csv-upload` and `auto-generated`
- Users can view full-size charts using the "View Graph" button
- All charts follow the same 2-column grid layout

## 🎉 **Getting Started**

1. **Navigate to Create Chart**: Click the "Create Chart" button
2. **Upload your CSV**: Choose a file with appropriate data
3. **Select chart type**: Choose the best visualization for your data
4. **Preview and create**: Review your data and generate the chart
5. **View in community feed**: Switch back to see your new chart

---

**Happy Charting! 📈✨**
