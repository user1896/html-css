// Generate status cards dynamically
function renderStatusCards(status, dataLabels, dataValues, dataIcons) {
    const container = document.querySelector('.status-cards-container');

    // Clear existing cards to prevent duplicates
    container.innerHTML = '';
    
    for(let i = 0; i < status.length; i++) {
        const currentStatus = status[i];
        const label = dataLabels[i];
        const count = dataValues[i];
        const icon = dataIcons[i];

        const card = document.createElement('div');
        card.className = `status-card card-${currentStatus}`;
        card.innerHTML = `
            <div class="card-icon">
                <i class="${icon}"></i>
            </div>
            <div class="card-content">
                <h3>${count}</h3>
                <p>${label.charAt(0).toUpperCase() + label.slice(1)}</p> <!-- Capitalize first letter + the rest of the word -->
            </div>
        `;
        container.appendChild(card);
    }
}

// Pie Chart
function renderPieChart(dataLabels, dataValues, dataColors) {
    const ctxPie = document.getElementById('pieChart').getContext('2d');

    // If chart already exists, update data and redraw
    if(myPieChart) {
        myPieChart.data.labels = dataLabels;
        myPieChart.data.datasets[0].data = dataValues;
        myPieChart.data.datasets[0].backgroundColor = dataColors;
        myPieChart.update(); // Triggers re-render
        return;
    }
    
    myPieChart = new Chart(ctxPie, {
        type: 'doughnut', // This can also be 'pie'
        data: {
            labels: dataLabels,
            datasets: [{
                label: 'Status Count',
                data: dataValues,
                backgroundColor: dataColors,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false, // Allow chart to resize based on container (so it can use thefull containers height when we add paddings to the title and legend)
            layout: {
                padding: {
                    // Optional: add padding around the chart
                }
            },
            onClick: (event, activeElements) => {
                if (activeElements.length > 0) { // checks if there are any active elements (slices)
                    const index = activeElements[0].index; // Get the index of the clicked slice
                    const clickedStatus = status[index]; // Get the corresponding status of the clicked slice
                    
                    const params = new URLSearchParams({
                        currentStatus: clickedStatus,
                        // add other parameters as needed
                    });
                    window.location.href = `dashboardTemplate.html?${params.toString()}`; // Navigate to the live monitoring page with query parameters
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Pourcentage de la flotte par statut',
                    padding: {
                        bottom: 10
                    }
                },
                legend: {
                    display: true, // Enable legend for pie charts
                    position: 'bottom', // Optional: position the legend
                    padding: {
                        // only controls spacing between individual legend items, not the gap between the legend box and the chart itself.à
                    }
                },
                datalabels: { // Configuration for Data Labels plugin
                    anchor: 'end', // Position at the edge of the slice
                    align: 'end', // Push labels away from the anchor point
                    offset: -4, // Add spacing between slice and label
                    color: '#000',
                    formatter: (value, context) => {
                        // Calculate total of all data points
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        // Calculate percentage
                        const percentage = (value / total * 100);

                        if(percentage < 1) {
                            return ''; // Don't display labels who are les than 1%
                        }

                        // return the percentage as a string with a '%' sign
                        return percentage.toFixed(1) + '%';
                    }
                }
            }
        },
        // When we include the Data Labels plugin CDN script, it creates a global variable
        // called "ChartDataLabels" that we need to register with the chart.
        plugins: [ChartDataLabels] // Register the Data Labels plugin
    });
}

// Bar Chart
function renderBarChart(dataLabels, dataValues, dataColors) {
    const ctxBar = document.getElementById('barChart').getContext('2d');

    // If chart already exists, update data and redraw
    if(myBarChart) {
        myBarChart.data.labels = dataLabels;
        myBarChart.data.datasets[0].data = dataValues;
        myBarChart.data.datasets[0].backgroundColor = dataColors;
        myBarChart.update(); // Triggers re-render
        return;
    }

    myBarChart = new Chart(ctxBar, {
        type: 'bar', // Specify bar chart type
        data: {
            labels: dataLabels,
            datasets: [{
                label: 'Status Count', // This dataset label is what Chart.js uses when it generates
                // the legend entries and also what appears in tooltips. However, since we have only
                // one dataset, it may not be necessary to display it, so below in
                // "options > plugings" we're hiding the legend.
                data: dataValues,
                backgroundColor: dataColors,
                borderWidth: 1
            }]
        },
        options: {
            onClick: (event, activeElements) => {
                if (activeElements.length > 0) { // checks if there are any active elements (slices)
                    const index = activeElements[0].index; // Get the index of the clicked slice
                    const clickedStatus = status[index]; // Get the corresponding status of the clicked slice
                    
                    const params = new URLSearchParams({
                        currentStatus: clickedStatus,
                        // add other parameters as needed
                    });
                    window.location.href = `dashboardTemplate.html?${params.toString()}`; // Navigate to the live monitoring page with query parameters
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Répartition des statuts'
                },
                legend: {
                    display: false // Hide legend since we have only one dataset
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Ensure the y-axis starts at zero
                    title: {
                        display: true,
                        text: 'Nombre de véhicules'
                    }
                }
            }
        }
    });
}

// Horizontal bar chart
function renderBarChartHorizontal(alertsLabels, alertsDataValues){
    const ctxBarHorizontal = document.getElementById('barChartHorizontal').getContext('2d');

    // Create a vertical gradient color for the bars
    const purpleGradient = ctxBarHorizontal.createLinearGradient(0, 0, 0, 400);
    purpleGradient.addColorStop(0, '#8456CE'); // Top color
    purpleGradient.addColorStop(1, 'rgba(132, 86, 206, 0.4)'); // Bottom color (faded)

    // If chart already exists, update data and redraw
    if(myBarChartHorizontal) {
        myBarChartHorizontal.data.labels = alertsLabels;
        myBarChartHorizontal.data.datasets[0].data = alertsDataValues;
        myBarChartHorizontal.data.datasets[0].backgroundColor = purpleGradient;
        myBarChartHorizontal.update(); // Triggers re-render
        return;
    }
    
    myBarChartHorizontal = new Chart(ctxBarHorizontal, {
        type: 'bar', // Specify bar chart type
        data: {
            labels: alertsLabels,
            datasets: [{
                label: 'Status Count', // This dataset label is what Chart.js uses when it generates
                // the legend entries and also what appears in tooltips. However, since we have only
                // one dataset, it may not be necessary to display it, so below in
                // "options > plugings" we're hiding the legend.
                data: alertsDataValues,
                backgroundColor: purpleGradient,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // This option makes the bars horizontal instead of vertical
            plugins: {
                title: {
                    display: true,
                    text: 'Analyse de la fréquence des alertes'
                },
                legend: {
                    display: false // Hide legend since we have only one dataset
                }
            },
            scales: {
                x: { // Since the bars are horizontal, the x-axis represents the count of vehicles
                    beginAtZero: true, // Ensure the y-axis starts at zero
                    title: {
                        display: true,
                        text: 'Nombre d\'alertes'
                    }
                }
            }
        }
    });
}

// this turns alertsData into and object with keys as "type" and values as the count of each type.
function getAlertsDataTypes(alertsData) {
    const dataTypes = {};
    
    alertsData.forEach(alert => {
        const type = alert.type;
        dataTypes[type] = (dataTypes[type] || 0) + 1;
    });
    
    return dataTypes;
}

function sortAlertsDescending(obj) {
    return Object.fromEntries(
        Object.entries(obj).sort((a, b) => b[1] - a[1])
    );
}

// Line chart
function renderLineChart(chartData) {
    const ctxLine = document.getElementById('lineChart').getContext('2d');

    // If chart already exists, update data and redraw
    if(myLineChart) {
        // myLineChart.data.labels = dataLabels;
        myLineChart.data.datasets[0].data = chartData;
        myLineChart.data.datasets[0].backgroundColor = '#8456CE';
        myLineChart.update(); // Triggers re-render
        return;
    }
    
    myLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Number of Alerts',
                data: chartData,
                fill: false, // if you want to fill the area under the line, set this to true and add a backgroundColor property with the desired color
                borderColor: '#8456CE',
                tension: 0.1 // Adjust the tension for smoother or sharper curves (0 for straight lines, higher values for more curvature)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Nombre d\'alertes par heure'
                },
                legend: {
                    display: false // Hide legend since we have only one dataset
                }
            },
            scales: {
                x: { type: 'time', time: { unit: 'hour' } },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'alertes'
                    }
                }
            }
        }
    });
}

function getAlertsByHour(alertsDataTime) {
    const hourly = {};
    alertsDataTime.forEach(dataTime => {
        // Extract the hour from the "occurred_at" timestamp (e.g. "2026-02-04T17:20:06.000000Z" → "2026-02-04T17")
        const date = new Date(dataTime.occurred_at);
        const hour = date.toISOString().slice(0, 13);  // YYYY-MM-DDTHH
        
        // Count the number of alerts for each hour
        hourly[hour] = (hourly[hour] || 0) + 1;
    });

    return Object.entries(hourly)
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort the entries by hour in ascending order
        .map(([label, count]) => ({ x: label, y: count })); // Convert to the format required by Chart.js (e.g. [{ x: "2026-02-04T17", y: 2 }, ...])
    // {"2026-02-05T07": 3, ...} becomes [{ x: "2026-02-05T07", y: 3 }, ...]
}