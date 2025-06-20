// Charts Component - Hebrew Interface
// Simple chart component using CSS and SVG for financial visualizations

class Charts {
    constructor(options = {}) {
        this.options = {
            width: 400,
            height: 300,
            margin: { top: 20, right: 20, bottom: 40, left: 60 },
            colors: ['#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'],
            ...options
        };
    }
    
    // Pie chart for category breakdown
    createPieChart(data, containerId) {
        const container = document.getElementById(containerId) || document.createElement('div');
        container.className = 'chart-container pie-chart';
        
        const total = data.reduce((sum, item) => sum + Math.abs(item.value), 0);
        if (total === 0) {
            container.innerHTML = this.renderEmptyChart('לא נמצאו נתונים להצגה');
            return container;
        }
        
        const radius = Math.min(this.options.width, this.options.height) / 2 - 40;
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        
        let currentAngle = -90; // Start from top
        
        const svg = `
            <div class="chart-header">
                <h3>פילוח לפי קטגוריות</h3>
                <div class="chart-total">סה"כ: ${formatCurrency(total)}</div>
            </div>
            <div class="chart-content">
                <svg width="${this.options.width}" height="${this.options.height}" viewBox="0 0 ${this.options.width} ${this.options.height}">
                    ${data.map((item, index) => {
                        const percentage = (Math.abs(item.value) / total) * 100;
                        const angle = (Math.abs(item.value) / total) * 360;
                        
                        if (percentage < 1) return ''; // Skip very small slices
                        
                        const slice = this.createPieSlice(
                            centerX, centerY, radius, 
                            currentAngle, currentAngle + angle,
                            this.options.colors[index % this.options.colors.length],
                            item.label,
                            percentage
                        );
                        
                        currentAngle += angle;
                        return slice;
                    }).join('')}
                    
                    <!-- Center circle for donut effect -->
                    <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.4}" 
                           fill="var(--bg-primary)" stroke="var(--border-color)" stroke-width="2"/>
                    <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" 
                          fill="var(--text-primary)" font-size="16" font-weight="600">
                        ${data.length}
                    </text>
                    <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" 
                          fill="var(--text-secondary)" font-size="12">
                        קטגוריות
                    </text>
                </svg>
                
                <div class="chart-legend">
                    ${data.map((item, index) => {
                        const percentage = ((Math.abs(item.value) / total) * 100).toFixed(1);
                        if (percentage < 1) return '';
                        
                        return `
                            <div class="legend-item">
                                <div class="legend-color" style="background-color: ${this.options.colors[index % this.options.colors.length]}"></div>
                                <div class="legend-label">
                                    <span class="legend-name">${item.label}</span>
                                    <span class="legend-value">${formatCurrency(Math.abs(item.value))} (${percentage}%)</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = svg;
        return container;
    }
    
    createPieSlice(centerX, centerY, radius, startAngle, endAngle, color, label, percentage) {
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;
        
        const x1 = centerX + radius * Math.cos(startRadians);
        const y1 = centerY + radius * Math.sin(startRadians);
        const x2 = centerX + radius * Math.cos(endRadians);
        const y2 = centerY + radius * Math.sin(endRadians);
        
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');
        
        // Calculate label position
        const labelAngle = (startAngle + endAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
        const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
        
        return `
            <path d="${pathData}" 
                  fill="${color}" 
                  stroke="var(--bg-primary)" 
                  stroke-width="2"
                  class="pie-slice"
                  data-label="${label}"
                  data-percentage="${percentage.toFixed(1)}">
                <title>${label}: ${percentage.toFixed(1)}%</title>
            </path>
            ${percentage > 5 ? `
                <text x="${labelX}" y="${labelY}" 
                      text-anchor="middle" 
                      fill="white" 
                      font-size="11" 
                      font-weight="600"
                      pointer-events="none">
                    ${percentage.toFixed(0)}%
                </text>
            ` : ''}
        `;
    }
    
    // Bar chart for spending over time
    createBarChart(data, containerId) {
        const container = document.getElementById(containerId) || document.createElement('div');
        container.className = 'chart-container bar-chart';
        
        if (!data || data.length === 0) {
            container.innerHTML = this.renderEmptyChart('לא נמצאו נתונים להצגה');
            return container;
        }
        
        const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
        const chartWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const chartHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;
        
        const svg = `
            <div class="chart-header">
                <h3>הוצאות לאורך זמן</h3>
                <div class="chart-period">נתונים חודשיים</div>
            </div>
            <div class="chart-content">
                <svg width="${this.options.width}" height="${this.options.height}" viewBox="0 0 ${this.options.width} ${this.options.height}">
                    <!-- Chart background -->
                    <rect x="${this.options.margin.left}" 
                          y="${this.options.margin.top}" 
                          width="${chartWidth}" 
                          height="${chartHeight}"
                          fill="var(--bg-secondary)"
                          stroke="var(--border-color)"
                          rx="4"/>
                    
                    <!-- Y-axis grid lines -->
                    ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const y = this.options.margin.top + chartHeight * (1 - ratio);
                        const value = maxValue * ratio;
                        return `
                            <line x1="${this.options.margin.left}" 
                                  y1="${y}" 
                                  x2="${this.options.margin.left + chartWidth}" 
                                  y2="${y}"
                                  stroke="var(--border-light)" 
                                  stroke-dasharray="2,2"/>
                            <text x="${this.options.margin.left - 10}" 
                                  y="${y + 4}" 
                                  text-anchor="end" 
                                  fill="var(--text-secondary)" 
                                  font-size="10">
                                ${this.formatAxisValue(value)}
                            </text>
                        `;
                    }).join('')}
                    
                    <!-- Bars -->
                    ${data.map((item, index) => {
                        const barHeight = (Math.abs(item.value) / maxValue) * chartHeight;
                        const x = this.options.margin.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
                        const y = this.options.margin.top + chartHeight - barHeight;
                        const color = item.value >= 0 ? this.options.colors[1] : this.options.colors[4];
                        
                        return `
                            <rect x="${x}" 
                                  y="${y}" 
                                  width="${barWidth}" 
                                  height="${barHeight}"
                                  fill="${color}"
                                  stroke="var(--border-color)"
                                  rx="2"
                                  class="bar-item"
                                  data-label="${item.label}"
                                  data-value="${item.value}">
                                <title>${item.label}: ${formatCurrency(item.value)}</title>
                            </rect>
                            
                            <!-- Bar labels -->
                            <text x="${x + barWidth / 2}" 
                                  y="${this.options.margin.top + chartHeight + 15}" 
                                  text-anchor="middle" 
                                  fill="var(--text-secondary)" 
                                  font-size="10">
                                ${item.label}
                            </text>
                            
                            <!-- Value labels on top of bars -->
                            ${barHeight > 20 ? `
                                <text x="${x + barWidth / 2}" 
                                      y="${y - 5}" 
                                      text-anchor="middle" 
                                      fill="var(--text-primary)" 
                                      font-size="10"
                                      font-weight="600">
                                    ${this.formatAxisValue(Math.abs(item.value))}
                                </text>
                            ` : ''}
                        `;
                    }).join('')}
                    
                    <!-- X-axis -->
                    <line x1="${this.options.margin.left}" 
                          y1="${this.options.margin.top + chartHeight}" 
                          x2="${this.options.margin.left + chartWidth}" 
                          y2="${this.options.margin.top + chartHeight}"
                          stroke="var(--border-color)" 
                          stroke-width="2"/>
                    
                    <!-- Y-axis -->
                    <line x1="${this.options.margin.left}" 
                          y1="${this.options.margin.top}" 
                          x2="${this.options.margin.left}" 
                          y2="${this.options.margin.top + chartHeight}"
                          stroke="var(--border-color)" 
                          stroke-width="2"/>
                </svg>
            </div>
        `;
        
        container.innerHTML = svg;
        return container;
    }
    
    // Line chart for trends
    createLineChart(data, containerId) {
        const container = document.getElementById(containerId) || document.createElement('div');
        container.className = 'chart-container line-chart';
        
        if (!data || data.length === 0) {
            container.innerHTML = this.renderEmptyChart('לא נמצאו נתונים להצגה');
            return container;
        }
        
        const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue;
        const chartWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const chartHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;
        
        // Calculate points for the line
        const points = data.map((item, index) => {
            const x = this.options.margin.left + (index / (data.length - 1)) * chartWidth;
            const y = this.options.margin.top + chartHeight - ((item.value - minValue) / range) * chartHeight;
            return { x, y, ...item };
        });
        
        const pathData = points.map((point, index) => 
            index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
        ).join(' ');
        
        const svg = `
            <div class="chart-header">
                <h3>מגמות פיננסיות</h3>
                <div class="chart-range">טווח: ${formatCurrency(minValue)} - ${formatCurrency(maxValue)}</div>
            </div>
            <div class="chart-content">
                <svg width="${this.options.width}" height="${this.options.height}" viewBox="0 0 ${this.options.width} ${this.options.height}">
                    <!-- Chart background -->
                    <rect x="${this.options.margin.left}" 
                          y="${this.options.margin.top}" 
                          width="${chartWidth}" 
                          height="${chartHeight}"
                          fill="var(--bg-secondary)"
                          stroke="var(--border-color)"
                          rx="4"/>
                    
                    <!-- Grid lines -->
                    ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const y = this.options.margin.top + chartHeight * ratio;
                        const value = maxValue - (range * ratio);
                        return `
                            <line x1="${this.options.margin.left}" 
                                  y1="${y}" 
                                  x2="${this.options.margin.left + chartWidth}" 
                                  y2="${y}"
                                  stroke="var(--border-light)" 
                                  stroke-dasharray="2,2"/>
                            <text x="${this.options.margin.left - 10}" 
                                  y="${y + 4}" 
                                  text-anchor="end" 
                                  fill="var(--text-secondary)" 
                                  font-size="10">
                                ${this.formatAxisValue(value)}
                            </text>
                        `;
                    }).join('')}
                    
                    <!-- Area fill under the line -->
                    <path d="${pathData} L ${points[points.length - 1].x} ${this.options.margin.top + chartHeight} L ${points[0].x} ${this.options.margin.top + chartHeight} Z"
                          fill="url(#lineGradient)"
                          opacity="0.3"/>
                    
                    <!-- The line -->
                    <path d="${pathData}"
                          fill="none"
                          stroke="${this.options.colors[0]}"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"/>
                    
                    <!-- Data points -->
                    ${points.map(point => `
                        <circle cx="${point.x}" 
                                cy="${point.y}" 
                                r="4"
                                fill="${this.options.colors[0]}"
                                stroke="var(--bg-primary)"
                                stroke-width="2"
                                class="data-point"
                                data-label="${point.label}"
                                data-value="${point.value}">
                            <title>${point.label}: ${formatCurrency(point.value)}</title>
                        </circle>
                    `).join('')}
                    
                    <!-- X-axis labels -->
                    ${points.map((point, index) => {
                        if (index % Math.ceil(points.length / 6) === 0) {
                            return `
                                <text x="${point.x}" 
                                      y="${this.options.margin.top + chartHeight + 15}" 
                                      text-anchor="middle" 
                                      fill="var(--text-secondary)" 
                                      font-size="10">
                                    ${point.label}
                                </text>
                            `;
                        }
                        return '';
                    }).join('')}
                    
                    <!-- Gradient definition -->
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${this.options.colors[0]};stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:${this.options.colors[0]};stop-opacity:0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
        
        container.innerHTML = svg;
        return container;
    }
    
    // Helper methods
    formatAxisValue(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return Math.round(value).toString();
    }
    
    renderEmptyChart(message) {
        return `
            <div class="chart-empty">
                <div class="empty-icon">📊</div>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Generate sample data for demonstrations
    static getSampleCategoryData() {
        return [
            { label: 'מזון', value: 2850 },
            { label: 'תחבורה', value: 1200 },
            { label: 'דיור', value: 4500 },
            { label: 'בידור', value: 800 },
            { label: 'בריאות', value: 600 },
            { label: 'קניות', value: 1400 },
            { label: 'ביטוח', value: 900 }
        ];
    }
    
    static getSampleMonthlyData() {
        const months = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יונ׳'];
        return months.map(month => ({
            label: month,
            value: Math.random() * 5000 + 1000
        }));
    }
    
    static getSampleTrendData() {
        const months = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יונ׳', 'יול׳', 'אוג׳'];
        let value = 3000;
        return months.map(month => {
            value += (Math.random() - 0.5) * 1000;
            return { label: month, value: Math.max(value, 500) };
        });
    }
}

// Chart utilities for creating common financial charts
class FinancialCharts {
    static createExpenseBreakdown(transactions, containerId) {
        const categoryTotals = {};
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
            });
        
        const data = Object.entries(categoryTotals)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8 categories
        
        const charts = new Charts();
        return charts.createPieChart(data, containerId);
    }
    
    static createMonthlySpending(transactions, containerId) {
        const monthlyTotals = {};
        const now = new Date();
        
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('he-IL', { month: 'short' });
            monthlyTotals[key] = 0;
        }
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const date = new Date(t.date);
                const key = date.toLocaleDateString('he-IL', { month: 'short' });
                if (monthlyTotals.hasOwnProperty(key)) {
                    monthlyTotals[key] += Math.abs(t.amount);
                }
            });
        
        const data = Object.entries(monthlyTotals)
            .map(([label, value]) => ({ label, value }));
        
        const charts = new Charts();
        return charts.createBarChart(data, containerId);
    }
    
    static createIncomeVsExpenses(transactions, containerId) {
        const monthlyData = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('he-IL', { month: 'short' });
            monthlyData[key] = { income: 0, expenses: 0 };
        }
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = date.toLocaleDateString('he-IL', { month: 'short' });
            if (monthlyData.hasOwnProperty(key)) {
                if (t.type === 'income') {
                    monthlyData[key].income += t.amount;
                } else {
                    monthlyData[key].expenses += Math.abs(t.amount);
                }
            }
        });
        
        const data = Object.entries(monthlyData)
            .map(([label, values]) => ({ 
                label, 
                value: values.income - values.expenses // Net savings
            }));
        
        const charts = new Charts();
        return charts.createLineChart(data, containerId);
    }
}

// Make components available globally
window.Charts = Charts;
window.FinancialCharts = FinancialCharts;

console.log('📊 Charts component loaded');