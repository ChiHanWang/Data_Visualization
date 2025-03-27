# Data_Visualization
### Data Visualization at National Yang Ming Chiao Tung University
Lecturer: Prof. [Yu-Shuen Wang](https://www.cs.nycu.edu.tw/members/detail/yushuen)

### Assignments:

- HW1: Scatter Plots
  - My goal is to implement a web-based scatter plot to show the iris dataset by using D3.
  - Users can determine the x-axis (and y-axis) to show the values of one of the attributes, such as sepal length, sepal width, petal length, and petal width, when interacting with the tool.
  -  Render scatter points in different colors to represent three different flower classes.

- HW2: Parallel Coordinate Plots
  - Users can change the order of the axes.
  - The axes are four different attributes such as sepal length, sepal width, petal length, and petal width.
  - Render poly-lines (flower samples: Iris setosa, Iris versicolor and Iris virginica) in different hues to represent three different flower classes.

- HW3: Correlation matrices
  - Be tasked with creating three correlation matrices corresponding to the three categories of abalone data: male, female, and infant, utilizing D3.
  - The design facilitates users in swiftly discerning correlations among attributes and in making visual contrasts across the three abalone types.
 
- HW4: Brushable Scatter Plot Matrix
  - Construct brushable scatter plot matrices for the Iris dataset utilizing D3.
  - Given the dataset has four features for each class, my task involves generating a 4x4 scatter plot grid.
  - Each plot represents the relationship between two attributes, while plots along the diagonal should display histograms of the respective attribute.
  - My system lets users to select specific data points within a plot, and these selected points should be emphasized in the other plots for easier analysis.
  - It means users can use your mouse to select different feature points to observe the relationship between them.

- HW5: Stacked Bar Charts
  - Craft stacked bar charts to represent the World University Rankings using D3.
  - I use distinct colors to represent each criterion within the stacked bars.
  - I design tooltips that display exact scores when hovered over a specific section of the bar.
  - The stacked bar charts are horizontal stacking style.
  - Data Representation
    - Every stacked bar represents the overall score of a specific university.
    - Within each bar, the scores contain five different criteria (namely teaching, research, citations, industry income, and international outlook).
  - Sorting Criteria
    - By overall scores.
    - By each individual criterion (teaching, research, citations, industry income, and international outlook).
    - Both in ascending and descending orders.
  - [Times World University Rankings 2024](https://www.kaggle.com/datasets/ddosad/timesworlduniversityrankings2024)

- HW6: ThemeRiver
  - The ThemeRiver chart shows how the median prices of different house property types change over time.
  - The direction of the river is from left to right.
  - Users can reorder the streams by dragging the different property type blocks.
  - Users can hover your mouse over a specific stream, and a tooltip will display the corresponding property type for that stream.
  - Users can hover your mouse over a specific property type block to get a zoomed-in effect with additional information about the block.
  - [House Property Sales Time Series](https://www.kaggle.com/datasets/htagholdings/property-sales/)
 
- HW7: Horizon Charts
  - The Horizon charts show the pollution effect in Seoul.
  - The data set contains 25 districts in Seoul with 6 different pollutants, creating 150 horizon charts.
  - Users can choose one of air pollutant to observe the pollution effect of regions in Seoul during 2017-2019.
  - [Air Pollution in Seoul](https://www.kaggle.com/datasets/bappekim/air-pollution-in-seoul)
 
- HW8: Sankey Diagram
  - Sankey Diagram displays relationships between the categorical attributes: buying, maintenance, doors, persons, luggage boot, and safety.
  - The width of the bands in the Sankey Diagram represents the proportion or count of the dataset that holds that relationship.
  - I use a clear color distinction for different categories, and provide a legend that explains any color or symbol used.
  - Users can rearrange the Sankey nodes to declutter the view or focus on specific relationships.
  - When users hover over the bands in the Sankey Diagram, it shows counts between two attributes.
  - [Car Evaluation Data](https://archive.ics.uci.edu/dataset/19/car+evaluation)

 
### Final Project:

- Covid 19 death toll in the world
  - We aim to gain a deeper understanding of the COVID-19 death toll across regions by creating various visualizations, which will help analyze and compare the trends in death rates during the pandemic.
  - There are three different visual charts displayed on **index.html**.
  - Charts
    - Bubble Map: Visualize death rate changes over time in the world.
    - Line Chart: Track death trends over time by regions.
    - Bar Chart: Rank regions by death counts over time.
  - [Covid 19 data](https://github.com/owid/covid-19-data/tree/master)
